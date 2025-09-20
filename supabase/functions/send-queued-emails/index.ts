// @ts-nocheck
// Supabase Edge Function: send-queued-emails
// Dequeues rows from public.email_outbox and sends emails via Gmail SMTP.
// Runtime: Deno
// Schedule: configure in Supabase Dashboard (e.g., every 5 minutes)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
// Using Resend HTTPS API instead of SMTP (Edge Functions can't use SMTP ports reliably)

// Config resolution order:
// 1) Settings table (optional): public.settings with key/value or name/value (category 'email') for FROM_EMAIL
// 2) Environment secrets: RESEND_API_KEY (required), FROM_EMAIL (optional, fallback to settings)

type OutboxRow = {
  id: string
  to_email: string
  to_name?: string | null
  subject: string
  body_html?: string | null
  attachment_path?: string | null
}

async function getConfig(supabase: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
  let fromEmail = Deno.env.get('FROM_EMAIL') || ''

  // Try to read from a generic settings table if present
  try {
    // Try common shapes
    const { data: rows } = await supabase
      .from('settings')
      .select('*')
      .or('category.eq.email,name.eq.smtp_host,key.eq.smtp_host')
      .limit(100)

    const getVal = (keys: string[]) => {
      const r = (rows || []).find((x: any) => keys.includes(String(x.key || x.name)))
      return r ? String(r.value ?? r.val ?? r.content ?? '') : ''
    }

    const hostDb = getVal(['smtp_host'])
    const portDb = Number(getVal(['smtp_port']))
    const fromDb = getVal(['from_email'])

    fromEmail = fromDb || fromEmail
  } catch (_) {
    // Table not present — ignore
  }

  if (!resendApiKey) throw new Error('Missing RESEND_API_KEY')
  if (!fromEmail) throw new Error('Missing FROM_EMAIL')
  return { resendApiKey, fromEmail }
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

Deno.serve(async (_req) => {
  let step = 'start'
  try {
    const SUPABASE_URL =
      Deno.env.get('SUPABASE_URL') ||
      Deno.env.get('PROJECT_URL') ||
      Deno.env.get('SB_URL') ||
      ''
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SB_SERVICE_ROLE_KEY') ||
      ''

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 })
    }

    step = 'init_supabase'
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    step = 'load_config'
    const cfg = await getConfig(supabase)

    step = 'fetch_queue'
    const { data: rows, error: qErr } = await supabase
      .from('email_outbox')
      .select('id, to_email, to_name, subject, body_html, attachment_path')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(20)

    if (qErr) throw qErr

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), { status: 200 })
    }

    let sent = 0
    for (const row of rows as OutboxRow[]) {
      try {
        step = 'prepare_email'
        let attachmentName: string | undefined
        let attachmentBytes: Uint8Array | undefined

        // Try to load attachment from Storage if provided
        if (row.attachment_path) {
          try {
            const bucket = Deno.env.get('MEAL_PLANS_BUCKET') || 'meal_plans'
            const { data, error: dErr } = await supabase.storage.from(bucket).download(row.attachment_path)
            if (!dErr && data) {
              const buf = new Uint8Array(await data.arrayBuffer())
              attachmentBytes = buf
              attachmentName = row.attachment_path.split('/').pop() || 'attachment.pdf'
            }
          } catch (_) {
            // Ignore attachment failure; still send email without it
          }
        }

        const html = row.body_html || ''

        // Build Resend payload
        const payload: any = {
          from: cfg.fromEmail,
          to: row.to_email,
          subject: row.subject,
          html,
        }
        if (attachmentBytes && attachmentName) {
          payload.attachments = [
            {
              filename: attachmentName,
              content: toBase64(attachmentBytes),
              content_type: 'application/pdf',
            },
          ]
        }

        step = 'resend_send'
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!resp.ok) {
          const text = await resp.text()
          throw new Error(`Resend error ${resp.status}: ${text}`)
        }

        step = 'mark_sent'
        try {
          await supabase
            .from('email_outbox')
            .update({ status: 'sent', sent_at: new Date().toISOString(), last_error: null, tries: (row as any).tries ?? 0 })
            .eq('id', row.id)
        } catch (_) {
          await supabase
            .from('email_outbox')
            .update({ status: 'sent' })
            .eq('id', row.id)
        }

        sent += 1
      } catch (sendErr) {
        // On failure, increment tries and record error
        try {
          await supabase
            .from('email_outbox')
            .update({ status: 'failed', tries: ((row as any).tries ?? 0) + 1, last_error: String(sendErr) })
            .eq('id', row.id)
        } catch (_) {
          await supabase
            .from('email_outbox')
            .update({ status: 'failed' })
            .eq('id', row.id)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: rows.length, sent }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e), step }), { status: 500 })
  }
})
