
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { type, productId, amount, productName, description } = await req.json();

    if (!type || !productId || !amount || !productName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get Paystack secret key from environment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    // Create direct Paystack transaction for inline popup
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com', // This will be updated when customer provides email
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        callback_url: 'https://www.teneraholisticandwellness.com/thankyoupage',
        metadata: {
          product_type: type,
          product_id: productId,
          product_name: productName,
          description: description || `${type} offer for ${productName}`
        },
        subaccount: 'ACCT_45gk2veg7xobren'
      })
    });

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      throw new Error(`Paystack API error: ${errorText}`);
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to create Paystack transaction');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store transaction record
    const { error: insertError } = await supabase
      .from('upsell_transactions')
      .insert({
        product_type: type,
        reference: paystackData.data.reference,
        paystack_url: paystackData.data.authorization_url,
        price: amount,
        status: 'initiated',
        email: 'customer@example.com'
      });

    if (insertError) {
      console.error('Error storing transaction:', insertError);
      // Don't fail the request if we can't store the transaction
    }

    // Return transaction data for inline popup
    return new Response(
      JSON.stringify({
        success: true,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        amount: amount,
        email: 'customer@example.com',
        public_key: 'pk_live_4d0939de823de47bc4c580f73f30accbb2d39c89',
        callback_url: 'https://www.teneraholisticandwellness.com/thankyoupage'
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Create upsell link error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
