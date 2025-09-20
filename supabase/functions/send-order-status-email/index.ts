import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, orderId, status } = await req.json();
    if (!email || !orderId || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const subject = `Update on Your Order (${orderId}): ${statusText}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <p>Hi${name ? ' ' + name : ''},</p>
          <p>Your order <b>${orderId}</b> status has been updated to:</p>
          <h2 style="color: #667eea;">${statusText}</h2>
          <p>If you have any questions, reply to this email or contact us at <a href="mailto:info@bouncebacktolifeconsult.pro">info@bouncebacktolifeconsult.pro</a>.</p>
          <p style="margin-top: 32px; color: #888; font-size: 13px;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;
    await resend.emails.send({
      from: "Bounce Back To Life Consult <info@bouncebacktolifeconsult.pro>",
      to: [email],
      subject,
      html,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Error sending order status email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}); 