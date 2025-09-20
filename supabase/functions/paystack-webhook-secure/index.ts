import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

// Enhanced rate limiting with Redis-like store simulation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string, limit: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = `webhook_${ip}_${Math.floor(now / windowMs)}`;
  
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  // Cleanup old entries
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  return true;
};

const validateOrigin = (origin: string | null): boolean => {
  const allowedOrigins = [
    'https://paystack.co',
    'https://api.paystack.co',
  ];
  return origin ? allowedOrigins.some(allowed => origin.includes(allowed)) : false;
};

const logSecurityEvent = async (supabase: any, eventType: string, details: any, ip?: string) => {
  try {
    await supabase.from('security_events').insert({
      event_type: eventType,
      ip_address: ip,
      metadata: details,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

serve(async (req) => {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enhanced rate limiting
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Origin validation
    const origin = req.headers.get('origin');
    if (origin && !validateOrigin(origin)) {
      console.warn(`Suspicious origin: ${origin} from IP: ${clientIP}`);
    }

    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    // Enhanced webhook signature verification
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Paystack secret key not configured');
    }

    if (signature) {
      const expectedSignature = createHmac('sha512', secretKey).update(body).digest('hex');
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature from IP:', clientIP);
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    const event = JSON.parse(body);
    
    // Input validation
    if (!event.event || !event.data) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Log webhook received event
    await logSecurityEvent(supabase, 'webhook_received', {
      event_type: event.event,
      reference: event.data?.reference,
      amount: event.data?.amount,
    }, clientIP);

    if (event.event === "charge.success") {
      const paymentData = event.data;
      
      // Enhanced input validation
      if (!paymentData.customer?.email || !paymentData.reference || !paymentData.amount) {
        await logSecurityEvent(supabase, 'webhook_invalid_data', { paymentData }, clientIP);
        return new Response(JSON.stringify({ error: 'Invalid payment data' }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      
      // Sanitize and validate inputs
      const customerEmail = paymentData.customer.email.toLowerCase().trim();
      const customerName = (paymentData.metadata?.customer_name || 
        `${paymentData.customer.first_name || ''} ${paymentData.customer.last_name || ''}`.trim()) || 'Unknown';
      const amount = Math.abs(paymentData.amount / 100); // Ensure positive amount
      const reference = paymentData.reference.replace(/[^a-zA-Z0-9_-]/g, ''); // Sanitize reference
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        await logSecurityEvent(supabase, 'webhook_invalid_email', { email: customerEmail }, clientIP);
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Check for duplicate transactions
      let existingOrder;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, payment_status, order_status, total_amount')
          .eq('payment_reference', reference)
          .maybeSingle();
        
        if (error) throw error;
        existingOrder = data;
      } catch (checkError) {
        console.error('Error checking for existing order:', checkError);
        await logSecurityEvent(supabase, 'webhook_db_error', { error: checkError.message }, clientIP);
      }

      if (existingOrder) {
        // Prevent duplicate processing
        if (existingOrder.payment_status === 'paid') {
          await logSecurityEvent(supabase, 'webhook_duplicate_payment', { reference }, clientIP);
          return new Response(JSON.stringify({ received: true, message: 'Already processed' }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Update existing order
        try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              order_status: 'confirmed',
              total_amount: amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingOrder.id);
            
          if (updateError) throw updateError;
          await logSecurityEvent(supabase, 'order_updated', { orderId: existingOrder.id, reference }, clientIP);
        } catch (updateError) {
          console.error('Error updating existing order:', updateError);
          await logSecurityEvent(supabase, 'webhook_update_error', { error: updateError.message }, clientIP);
        }
      } else {
        // Create new order with enhanced validation
        try {
          let cartItems = [];
          try {
            cartItems = JSON.parse(paymentData.metadata?.cart_items || '[]');
            // Validate cart items structure
            if (!Array.isArray(cartItems)) {
              cartItems = [];
            }
          } catch (parseError) {
            console.error('Error parsing cart items:', parseError);
            cartItems = [];
          }

          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: paymentData.metadata?.customer_phone?.replace(/[^\d+\-\s()]/g, '') || null,
              delivery_address: paymentData.metadata?.delivery_address?.substring(0, 500) || null,
              delivery_city: paymentData.metadata?.delivery_city?.substring(0, 100) || null,
              delivery_state: paymentData.metadata?.delivery_state?.substring(0, 100) || null,
              total_amount: amount,
              payment_reference: reference,
              payment_status: 'paid',
              status: 'confirmed',
              items: cartItems,
              created_at: new Date().toISOString()
            });
            
          if (orderError) {
            console.error('Error creating order:', orderError);
            await logSecurityEvent(supabase, 'webhook_order_error', { error: orderError.message }, clientIP);
          } else {
            await logSecurityEvent(supabase, 'order_created', { reference, amount }, clientIP);
          }
        } catch (insertError) {
          console.error('Error inserting new order:', insertError);
          await logSecurityEvent(supabase, 'webhook_insert_error', { error: insertError.message }, clientIP);
        }
      }

      // Send confirmation emails with rate limiting
      try {
        let cartItems = [];
        try {
          cartItems = JSON.parse(paymentData.metadata?.cart_items || '[]');
        } catch (parseError) {
          console.error('Error parsing cart items for email:', parseError);
        }
        
        // Rate limit email sending
        if (checkRateLimit(`email_${customerEmail}`, 3, 300000)) { // 3 emails per 5 minutes per email
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
        } else {
          await logSecurityEvent(supabase, 'email_rate_limited', { email: customerEmail }, clientIP);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        await logSecurityEvent(supabase, 'webhook_email_error', { error: emailError.message }, clientIP);
      }
    }

    await logSecurityEvent(supabase, 'webhook_processed', { event_type: event.event }, clientIP);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await logSecurityEvent(supabase, 'webhook_critical_error', { 
        error: error.message,
        stack: error.stack 
      }, clientIP);
    } catch (logError) {
      console.error('Failed to log critical error:', logError);
    }
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});