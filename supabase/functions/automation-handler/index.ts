import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "info@bouncebacktolifeconsult.pro";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let event;
  try {
    event = await req.json();
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { type, customer, order, extra } = event;
  if (!type || !customer || !customer.email) {
    return new Response("Missing required event data", { status: 400 });
  }

  // Find matching automations
  const { data: automations, error } = await supabase
    .from("automations")
    .select("*")
    .eq("trigger", type)
    .eq("is_active", true);

  if (error) {
    return new Response("Failed to fetch automations", { status: 500 });
  }

  let actionsLog = [];

  for (const rule of automations || []) {
    if (rule.action === "assign_tag" && rule.action_data) {
      // Assign tag to customer
      await supabase.from("tag_assignments").insert({
        customer_email: customer.email,
        customer_name: customer.name || null,
        tag_id: rule.action_data,
        created_at: new Date().toISOString(),
      });
      actionsLog.push({ action: "assign_tag", tag_id: rule.action_data });
    }
    if (rule.action === "send_email_campaign" && rule.action_data) {
      // Fetch campaign template
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .select("*, template:email_templates(*)")
        .eq("id", rule.action_data)
        .single();
      if (campaignError || !campaign) {
        actionsLog.push({ action: "send_email_campaign", campaign_id: rule.action_data, error: "Campaign not found" });
        continue;
      }
      const subject = campaign.subject || campaign.template?.subject || "";
      let html = campaign.template?.body || "<p>Hello from your campaign!</p>";
      // Replace merge tags
      html = html.replace(/{{customer_name}}/g, customer.name || "Customer");
      html = html.replace(/{{customer_email}}/g, customer.email);
      // Check for delay in rule.trigger_data (e.g., { delay_days: 30 })
      let delayDays = 0;
      try {
        if (rule.trigger_data) {
          const parsed = typeof rule.trigger_data === 'string' ? JSON.parse(rule.trigger_data) : rule.trigger_data;
          if (parsed && parsed.delay_days) delayDays = parseInt(parsed.delay_days);
        }
      } catch (e) {}
      if (delayDays > 0) {
        // Schedule for future
        const sendAt = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("scheduled_emails").insert({
          to_email: customer.email,
          subject,
          html,
          campaign_id: campaign.id,
          customer_email: customer.email,
          send_at: sendAt,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        actionsLog.push({ action: "schedule_email_campaign", campaign_id: rule.action_data, send_at: sendAt });
      } else {
        // Send email via Resend
        let emailResult = null;
        if (RESEND_API_KEY) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: customer.email,
              subject,
              html,
            }),
          });
          emailResult = await res.json();
        }
        actionsLog.push({ action: "send_email_campaign", campaign_id: rule.action_data, sent: !!emailResult, emailResult });
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, actions: actionsLog }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}); 