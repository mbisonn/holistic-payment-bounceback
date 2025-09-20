// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://esm.sh/@supabase/supabase-js@2.38.4"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      (globalThis as any).Deno?.env?.get?.('SUPABASE_URL') ?? '',
      (globalThis as any).Deno?.env?.get?.('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { productId, customerEmail, customerName, customerPhone } = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch the upsell product
    const { data: product, error: productError } = await supabase
      .from('upsell_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a unique reference for this upsell transaction
    const reference = `UPSELL_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Store the transaction record
    const { error: transactionError } = await supabase
      .from('upsell_transactions')
      .insert({
        product_id: productId,
        customer_email: customerEmail || 'guest@example.com',
        customer_name: customerName || 'Guest Customer',
        customer_phone: customerPhone || '',
        amount: product.discount_price || product.price,
        payment_reference: reference,
        status: 'pending',
        metadata: {
          product_name: product.name,
          product_type: product.type,
          original_price: product.price,
          discount_price: product.discount_price
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate the upsell payment link
    const baseUrl = 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com';
    const paymentLink = `${baseUrl}/upsell/${productId}?ref=${reference}&email=${encodeURIComponent(customerEmail || '')}&name=${encodeURIComponent(customerName || '')}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentLink,
        reference,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          discount_price: product.discount_price,
          image_url: product.image_url
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error creating upsell payment link:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});