import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find abandoned checkouts older than 30 minutes and not notified
  const { data, error } = await supabase
    .from("abandoned_checkouts")
    .select("*")
    .eq("notified", false)
    .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());

  if (error || !data || data.length === 0) {
    return new Response("No abandoned checkouts to notify.", { status: 200 });
  }

  for (const checkout of data) {
    const emailBody = `
      <h2>Abandoned Checkout</h2>
      <p><b>Name:</b> ${checkout.customer_name}</p>
      <p><b>Email:</b> ${checkout.customer_email}</p>
      <p><b>Phone:</b> ${checkout.customer_phone}</p>
      <p><b>Cart:</b> <pre>${JSON.stringify(checkout.cart_items, null, 2)}</pre></p>
      <p><b>Time:</b> ${checkout.created_at}</p>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "info@bouncebacktolifeconsult.pro",
        to: ["info@bouncebacktolifeconsult.pro", "pecjos2017@gmail.com", "sundaycollinsimoh@gmail.com"],
        subject: "Abandoned Checkout Notification",
        html: emailBody,
      }),
    });

    // Send reminder email to customer if email is available
    if (checkout.customer_email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "info@bouncebacktolifeconsult.pro",
          to: checkout.customer_email,
          subject: "You left something in your cart!",
          html: `<h2>Complete Your Purchase</h2><p>Hi${checkout.customer_name ? ' ' + checkout.customer_name : ''},</p><p>It looks like you left some items in your cart. Click <a href='https://www.teneraholisticandwellness.com/checkout'>here</a> to complete your order!</p><p><b>Your Cart:</b></p><pre>${JSON.stringify(checkout.cart_items, null, 2)}</pre>`
        }),
      });
    }

    await supabase
      .from("abandoned_checkouts")
      .update({ notified: true })
      .eq("id", checkout.id);
  }

  return new Response("Abandoned checkout notifications sent.", { status: 200 });
}); 