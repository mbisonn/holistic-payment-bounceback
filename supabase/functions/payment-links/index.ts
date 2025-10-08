
// @deno-types="https://deno.land/std@0.190.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

interface PaymentLinkRequest {
  type: 'upsell' | 'downsell';
  productId?: string;
  productName?: string;
  price?: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  reference?: string;
  redirectUrl?: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      (Deno as any).env.get('SUPABASE_URL') ?? '',
      (Deno as any).env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Parse request with validation
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    
    const { type, productId, productName, price, customerInfo, reference, redirectUrl } = reqBody as PaymentLinkRequest;
    
    // Validate required fields
    if (!type || !customerInfo || !customerInfo.email || !customerInfo.name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    
    // Validate type value
    if (type !== 'upsell' && type !== 'downsell') {
      return new Response(JSON.stringify({ error: 'Invalid product type' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Fetch product from database. Prefer provided productId; fallback to latest active.
    let product: any = null;
    if (productId) {
      const { data, error } = await supabaseClient
        .from('upsell_products')
        .select('*')
        .eq('id', productId)
        .single();
      if (!error) product = data;
    }
    if (!product) {
      const { data } = await supabaseClient
        .from('upsell_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      product = data;
    }

    if (!product) {
      return new Response(
        JSON.stringify({ error: `Product not found for type: ${type}` }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Create Paystack payment link
    const paystackSecretKey = (Deno as any).env.get('PAYSTACK_SECRET_KEY');
    const paystackSubAccount = 'ACCT_45gk2veg7xobren';
    
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Paystack secret key not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Sanitize inputs for security
    const sanitizedEmail = customerInfo.email.trim().toLowerCase();
    const sanitizedName = customerInfo.name.trim();
    
    // Use the provided redirect URL or default to thank you page
    const finalRedirectUrl = redirectUrl || 'https://www.teneraholisticandwellness.com/thankyoupage';
    
    // Prepare webhook URL for make.com
    const webhookUrl = (Deno as any).env.get('MAKE_WEBHOOK_URL');
    
    // Create payment request for Paystack
    const paymentData = {
      email: sanitizedEmail,
      amount: Math.round((price ?? product.price) * 100), // Convert to kobo
      callback_url: finalRedirectUrl,
      metadata: {
        name: sanitizedName,
        productId: product.id,
        productName: productName ?? product.name,
        productType: type,
        phone: customerInfo.phone ? customerInfo.phone.trim() : '',
      },
      ...(reference ? { reference: reference.trim() } : {}),
      subaccount: paystackSubAccount,
      ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
    };

    // Send request to Paystack with strict error handling
    let paystackResponse;
    try {
      const paystackReq = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!paystackReq.ok) {
        const errorText = await paystackReq.text();
        throw new Error(`Paystack API error: ${paystackReq.status} - ${errorText}`);
      }
      
      paystackResponse = await paystackReq.json() as PaystackResponse;
  } catch (error: any) {
      console.error('Paystack API error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment link', 
          details: error.message 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (!paystackResponse.status) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment link', 
          details: paystackResponse.message 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Log the transaction in the database
    try {
      await supabaseClient.from('upsell_transactions').insert({
        customer_email: sanitizedEmail,
        customer_name: sanitizedName,
        customer_phone: customerInfo.phone || '',
        product_id: product.id,
        amount: product.price,
        payment_reference: paystackResponse.data.reference,
        status: 'initiated',
        metadata: {
          payment_url: paystackResponse.data.authorization_url,
          product_type: type,
          product_name: product.name
        }
      });
    } catch (dbError) {
      console.error('Error logging transaction:', dbError);
      // Continue even if logging fails
    }

    // Return successful response with payment URL
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_url: paystackResponse.data.authorization_url,
          reference: paystackResponse.data.reference,
          access_code: paystackResponse.data.access_code,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
