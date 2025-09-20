
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderReference?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, orderItems, totalAmount, orderReference }: EmailRequest = await req.json();

    // Generate order items HTML
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    // Customer confirmation email
    const customerEmailResponse = await resend.emails.send({
      from: "Bounce Back To Life Consult <info@bouncebacktolifeconsult.pro>",
      to: [to],
      subject: "Order Confirmation - Thank You for Your Purchase!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Thank You ${customerName}!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your order has been confirmed</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
            ${orderReference ? `<p><strong>Order Reference:</strong> ${orderReference}</p>` : ''}
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
              <h3 style="margin: 0; color: #667eea; font-size: 24px;">Total: ₦${totalAmount.toLocaleString()}</h3>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>We'll process your order within 24 hours</li>
                <li>You'll receive a shipping confirmation email</li>
                <li>Track your order status in your account</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">Questions? Contact us at info@bouncebacktolifeconsult.pro</p>
          </div>
        </div>
      `
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: customerEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
