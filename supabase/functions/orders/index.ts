
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Log the request details for debugging
    console.log('Received order request:', req.method);
    
    // Create a Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Parse the request body with validation
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate the request data
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.error('Invalid or missing items in request');
      return new Response(
        JSON.stringify({ error: 'Invalid or missing items in request' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Format and sanitize items for security
    const formattedItems = body.items.map((item: any) => {
      // Ensure all values are properly validated and sanitized
      const id = String(item.id || item.sku || 'unknown').trim().slice(0, 100);
      const sku = String(item.sku || item.id || 'unknown').trim().slice(0, 100);
      const name = String(item.name || 'Unknown Product').trim().slice(0, 255);
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      
      return {
        id,
        sku,
        name,
        price: Math.max(0, price), // Ensure non-negative price
        quantity: Math.max(1, quantity), // Ensure positive quantity
        total: Math.max(0, price) * Math.max(1, quantity)
      };
    });
    
    // Calculate shipping fee based on state and item count
    const state = (body.customerInfo?.state || '').toLowerCase();
    let shippingFee = 0;
    if (state.includes('lagos')) {
      shippingFee = formattedItems.length >= 2 ? 0 : 2000;
    } else {
      shippingFee = 4000;
    }

    // Calculate total amount including shipping
    const totalAmount = formattedItems.reduce((sum, item) => sum + item.total, 0) + shippingFee;
    
    // Sanitize source information
    const source = String(body.source || req.headers.get('referer') || 'direct').trim().slice(0, 255);
    
    // Store the order data in Supabase
    try {
      // Create the order record
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([
          {
            items: formattedItems,
            total_amount: totalAmount,
            shipping_fee: shippingFee,
            source: source,
            status: 'pending',
            customer_info: body.customerInfo || null,
          }
        ]);
      
      if (orderError) {
        console.error('Error storing order:', orderError);
      } else {
        console.log('Order stored successfully:', orderData);
        
        // Send email notification to admin
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
            },
            body: JSON.stringify({
              from: 'info@bouncebacktolifeconsult.pro',
              to: ['info@bouncebacktolifeconsult.pro', 'pecjos2017@gmail.com', 'sundaycollinsimoh@gmail.com'],
              subject: 'New Order Received',
              html: `<h2>New Order Received</h2>
                <p><b>Customer:</b> ${body.customerInfo?.name || 'N/A'} (${body.customerInfo?.email || 'N/A'})</p>
                <p><b>Total:</b> ₦${totalAmount.toLocaleString()}</p>
                <p><b>Shipping Fee:</b> ₦${shippingFee.toLocaleString()}</p>
                <p><b>Items:</b></p>
                <ul>${formattedItems.map((item: any) => `<li>${item.name} x${item.quantity} - ₦${item.price}</li>`).join('')}</ul>
                <p><b>Source:</b> ${source}</p>
                <p><b>Date:</b> ${new Date().toLocaleString()}</p>`
            })
          });
        } catch (emailError) {
          console.error('Failed to send order email notification:', emailError);
        }
        
        // Send thank you email to customer
        try {
          const customerEmail = body.customerInfo?.email;
          const customerName = body.customerInfo?.name || '';
          const firstName = customerName.split(' ')[0] || 'Valued Customer';
          const productList = formattedItems.map((item: any) => `<li><b>${item.name}</b> — Quantity: ${item.quantity}</li>`).join('');
          
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
            },
            body: JSON.stringify({
              from: 'info@bouncebacktolifeconsult.pro',
              to: customerEmail,
              subject: `Thank You for Your Purchase, ${firstName}! 🎉`,
              html: `<h1>Order Confirmation</h1>
                <p>Dear ${firstName},</p>
                <p>Thank you for your order! We're excited to get your products to you.</p>
                <h3>Order Details:</h3>
                <ul>${productList}</ul>
                <p><b>Total Amount:</b> ₦${totalAmount.toLocaleString()}</p>
                <p>We'll be in touch soon with shipping details.</p>
                <p>Best regards,<br>Bounce Back To Life Consult Team</p>`
            })
          });
        } catch (customerEmailError) {
          console.error('Failed to send customer email:', customerEmailError);
        }
      }
    } catch (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order processed successfully',
        totalAmount,
        shippingFee 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
