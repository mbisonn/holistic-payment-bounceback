import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    // Verify webhook signature (optional but recommended)
    // const expectedSignature = createHmac('sha512', Deno.env.get('PAYSTACK_SECRET_KEY') || '').update(body).digest('hex');
    
    const event = JSON.parse(body);
    
    if (event.event === "charge.success") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const paymentData = event.data;
      
      // Extract customer and order information
      const customerEmail = paymentData.customer.email;
      const customerName = paymentData.metadata?.customer_name || paymentData.customer.first_name + ' ' + paymentData.customer.last_name;
      const amount = paymentData.amount / 100; // Convert from kobo to naira
      const reference = paymentData.reference;
      
      // Check if order with this payment reference already exists
      let existingOrder;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, payment_status, order_status')
          .eq('payment_reference', reference)
          .maybeSingle();
        if (error) throw error;
        existingOrder = data;
      } catch (checkError) {
        console.error('Error checking for existing order:', checkError);
      }

      if (existingOrder) {
        // Update the existing order's status
        try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              order_status: 'confirmed',
              total_amount: amount
            })
            .eq('id', existingOrder.id);
          if (updateError) throw updateError;
        } catch (updateError) {
          console.error('Error updating existing order:', updateError);
        }
      } else {
        // Insert a new order as fallback
        try {
          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: paymentData.metadata?.customer_phone,
              delivery_address: paymentData.metadata?.delivery_address,
              delivery_city: paymentData.metadata?.delivery_city,
              delivery_state: paymentData.metadata?.delivery_state,
              total_amount: amount,
              payment_reference: reference,
              payment_status: 'paid',
              order_status: 'confirmed',
              cart_items: paymentData.metadata?.cart_items || []
            });
          if (orderError) {
            console.error('Error creating order:', orderError);
          }
        } catch (insertError) {
          console.error('Error inserting new order:', insertError);
        }
      }

      // Send confirmation emails
      let cartItems = [];
      try {
        cartItems = JSON.parse(paymentData.metadata?.cart_items || '[]');
      } catch (parseError) {
        console.error('Error parsing cart items:', parseError);
      }
      
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            to: customerEmail,
            customerName: customerName,
            orderItems: cartItems,
            totalAmount: amount,
            orderReference: reference
          })
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
