// @ts-nocheck
// Supabase Edge Function: meal-plan-webhook
// Receives meal plan payloads from the external project, upserts customer,
// applies tag, uploads PDF to Storage, and queues email in email_outbox.
// Runtime: Deno

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Env vars required
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// FROM_EMAIL (optional, used by sender function)

// HMAC signature verification (optional but recommended)
async function verifySignature(secret: string, rawBody: string, signature: string | null): Promise<boolean> {
  if (!secret) return true; // if not configured, skip verification
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  const verified = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(rawBody));
  return verified;
}

interface Payload {
  email: string;
  name?: string;
  tag?: string;
  planUrl?: string;         // URL to a PDF
  planBase64?: string;      // base64-encoded PDF
  subject?: string;         // overrides
  bodyHtml?: string;        // overrides
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  let step = 'start';
  try {
    const SUPABASE_URL =
      Deno.env.get('SUPABASE_URL') ||
      Deno.env.get('PROJECT_URL') ||
      Deno.env.get('SB_URL') ||
      '';
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SB_SERVICE_ROLE_KEY') ||
      '';
    const WEBHOOK_SECRET = Deno.env.get('MEAL_PLAN_WEBHOOK_SECRET') || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });
    }

    step = 'read_body';
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature');
    if (WEBHOOK_SECRET) {
      const ok = await verifySignature(WEBHOOK_SECRET, rawBody, signature);
      if (!ok) return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    step = 'parse_payload';
    const payload: Payload = JSON.parse(rawBody || '{}');
    if (!payload.email) {
      return new Response(JSON.stringify({ error: 'email is required' }), { status: 400 });
    }

    step = 'init_supabase_client';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Upsert customer
    const email = payload.email.toLowerCase();
    const name = payload.name || email;
    // Upsert using customers.customer_email (uuid PK assumed on id). Only rely on customer_email column.
    step = 'upsert_customer';
    await supabase
      .from('customers')
      .upsert({ customer_email: email }, { onConflict: 'customer_email' });

    // 2) Ensure tag exists (default to 'Meal Plan' if none provided)
    const tagName = payload.tag?.trim() || 'Meal Plan';
    let tagId: string | null = null;
    {
      step = 'find_tag';
      const { data: foundTags, error: findTagErr } = await supabase.from('customer_tags').select('id').eq('name', tagName).limit(1);
      if (findTagErr) throw findTagErr;
      if (foundTags && foundTags.length > 0) {
        tagId = foundTags[0].id;
      } else {
        step = 'insert_tag';
        const { data: inserted, error: tagErr } = await supabase
          .from('customer_tags')
          .insert({ name: tagName, color: '#10B981' })
          .select('id').single();
        if (tagErr) throw tagErr;
        tagId = inserted?.id || null;
      }
    }

    // 3) Assign tag to customer via assignments table (uses email field per app convention)
    if (tagId) {
      // prevent duplicates
      step = 'assign_tag';
      await supabase
        .from('customer_tag_assignments')
        .upsert({ customer_email: email, tag_id: tagId }, { onConflict: 'customer_email,tag_id' });
    }

    // 4) Upload plan PDF to storage
    let attachmentPath: string | null = null;
    const bucket = Deno.env.get('MEAL_PLANS_BUCKET') || 'meal_plans';
    if (payload.planBase64) {
      step = 'upload_plan_base64';
      const bytes = Uint8Array.from(atob(payload.planBase64), (c) => c.charCodeAt(0));
      const fileName = `meal-plan-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(fileName, bytes, {
        contentType: 'application/pdf',
        upsert: false,
      });
      if (upErr) throw upErr;
      attachmentPath = fileName;
    } else if (payload.planUrl) {
      // fetch and re-upload for consistent storage
      step = 'fetch_plan_url';
      const resp = await fetch(payload.planUrl);
      if (!resp.ok) throw new Error('Failed to fetch planUrl');
      const buf = new Uint8Array(await resp.arrayBuffer());
      const fileName = `meal-plan-${Date.now()}.pdf`;
      step = 'upload_plan_buffer';
      const { error: upErr } = await supabase.storage.from(bucket).upload(fileName, buf, {
        contentType: 'application/pdf',
        upsert: false,
      });
      if (upErr) throw upErr;
      attachmentPath = fileName;
    }

    if (!attachmentPath) {
      return new Response(JSON.stringify({ error: 'Missing planBase64 or planUrl' }), { status: 400 });
    }

    // 5) Determine subject/body (payload overrides -> template/campaign fallback)
    let subject = payload.subject || 'Your Personalized Meal Plan';
    let bodyHtml = payload.bodyHtml || '';

    if (!payload.subject || !payload.bodyHtml) {
      // Try to locate the Meal Plan Auto-Send campaign and template
      step = 'fetch_campaign';
      const { data: camp, error: campErr } = await supabase
        .from('email_campaigns')
        .select('id, subject, template_id')
        .eq('name', 'Meal Plan Auto-Send')
        .limit(1)
        .maybeSingle();
      if (campErr) throw campErr;
      if (camp) {
        subject = payload.subject || camp.subject || subject;
        if (!payload.bodyHtml && camp.template_id) {
          step = 'fetch_template';
          const { data: tmpl, error: tmplErr } = await supabase
            .from('email_templates')
            .select('body')
            .eq('id', camp.template_id)
            .limit(1)
            .maybeSingle();
          if (tmplErr) throw tmplErr;
          bodyHtml = tmpl?.body || bodyHtml;
        }
      }
    }

    // Simple {{name}} replacement
    bodyHtml = (bodyHtml || 'Hello {{name}}, your meal plan is attached.').replace(/{{\s*name\s*}}/g, name);

    // 6) Queue email to outbox
    step = 'insert_outbox';
    const { error: outErr } = await supabase.from('email_outbox').insert({
      to_email: email,
      to_name: name,
      subject,
      body_html: bodyHtml,
      attachment_path: attachmentPath,
      status: 'queued',
    });
    if (outErr) return new Response(JSON.stringify({ error: outErr.message || 'insert_outbox failed', step, code: (outErr as any).code, details: (outErr as any).details || (outErr as any).hint }), { status: 500 });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    // Trimmed error response (less noisy, still actionable)
    const errAny: any = e as any;
    const errMsg = errAny?.message || errAny?.error?.message || String(e);
    const errCode = errAny?.code || errAny?.error?.code;
    const errDetails = errAny?.details || errAny?.error?.details || errAny?.hint || errAny?.error?.hint || errAny?.name;
    return new Response(JSON.stringify({ error: errMsg, step, code: errCode, details: errDetails }), { status: 500 });
  }
});
