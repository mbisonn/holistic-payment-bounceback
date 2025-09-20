// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "info@bouncebacktolifeconsult.pro";

serve(async (_req: any) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find all pending emails due to be sent
  const { data: emails, error } = await supabase
    .from("scheduled_emails")
    .select("*")
    .eq("status", "pending")
    .lte("send_at", new Date().toISOString());

  if (error) {
    return new Response("Failed to fetch scheduled emails", { status: 500 });
  }

  let results: any[] = [];

  for (const email of emails || []) {
    let sendResult: any = null;
    let status: string = 'sent';
    let errorMsg: string | null = null;
    try {
      if (RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email.to_email,
            subject: email.subject,
            html: email.html,
          }),
        });
        sendResult = await res.json();
        if (!sendResult || (sendResult && sendResult.error)) {
          status = 'error';
          errorMsg = sendResult?.error || 'Unknown error';
        }
      } else {
        status = 'error';
        errorMsg = 'Missing RESEND_API_KEY';
      }
    } catch (e: any) {
      status = 'error';
      errorMsg = e.message || 'Exception';
    }
    // Update scheduled_emails row
    await supabase.from("scheduled_emails").update({
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      error: errorMsg,
      updated_at: new Date().toISOString()
    }).eq("id", email.id);
    results.push({ id: email.id, status, error: errorMsg });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}); 