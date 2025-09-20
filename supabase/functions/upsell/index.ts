import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Secure headers
const getSecureHeaders = () => ({
  'Access-Control-Allow-Origin': 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
});

// Rate limiting
const rateLimitStore = new Map();
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const limit = 20; // 20 requests per minute
  
  const key = `${ip}_${Math.floor(now / windowMs)}`;
  const current = rateLimitStore.get(key) || 0;
  
  if (current >= limit) {
    return false;
  }
  
  rateLimitStore.set(key, current + 1);
  return true;
};

// Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"'&]/g, '').substring(0, 100);
};

serve(async (req) => {
  const corsHeaders = getSecureHeaders();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { headers: corsHeaders, status: 429 }
      );
    }

    const url = new URL(req.url);
    const params = url.searchParams;
    const isDirect = params.get('direct') === 'true';
    const type = params.get('type') || 'full';
    const email = params.get('email') || '';
    const customAmount = params.get('amount');
    
    // Input validation
    if (!['full', 'lite', 'custom'].includes(type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid product type' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (email && !validateEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (customAmount && (isNaN(parseInt(customAmount)) || parseInt(customAmount) <= 0)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid amount' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log(`[SECURITY] Processing ${type} upsell request. Direct: ${isDirect}, Email: ${email}`);
    
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      console.error('[SECURITY] Paystack secret key not configured');
      throw new Error('Payment service configuration error');
    }

    // Determine product data based on type
    let productData;
    
    if (type === 'custom' && customAmount) {
      const amount = parseInt(customAmount);
      if (amount > 1000000000) { // Max ₦10M
        return new Response(
          JSON.stringify({ success: false, error: 'Amount too large' }),
          { headers: corsHeaders, status: 400 }
        );
      }
      
      productData = {
        name: 'Tenera Wellness Products',
        price: amount, // Amount already in kobo
        duration_months: 0
      };
    } else if (type === 'full') {
      productData = {
        name: 'Tenera Tribe - Annual Membership',
        price: 5000000, // ₦50,000 in kobo
        duration_months: 12
      };
    } else {
      productData = {
        name: 'Tenera Tribe (Lite) - 3 Month Access',
        price: 1500000, // ₦15,000 in kobo
        duration_months: 3
      };
    }
    
    console.log(`[SECURITY] Using product data:`, productData);
    
    // Generate secure reference
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const reference = `TENERA_${type.toUpperCase()}_${timestamp}_${random}`;
    
    const redirectUrl = 'https://www.teneraholisticandwellness.com/upsell';
    const sanitizedEmail = email ? sanitizeString(email).toLowerCase() : 'customer@example.com';
    
    // Create direct transaction for inline popup
    const paymentData = {
      email: sanitizedEmail,
      amount: productData.price,
      reference,
      callback_url: redirectUrl,
      metadata: {
        product_name: sanitizeString(productData.name),
        product_type: type,
        duration_months: productData.duration_months
      },
      subaccount: "ACCT_45gk2veg7xobren",
      currency: "NGN"
    };

    console.log("[SECURITY] Creating transaction for inline popup with reference:", reference);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("[SECURITY] Paystack error:", paystackData.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment service error' 
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Store transaction in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error } = await supabase
          .from('upsell_transactions')
          .insert({
            reference,
            product_type: type,
            price: productData.price,
            email: sanitizedEmail,
            status: 'initiated',
            paystack_url: paystackData.data.authorization_url
          });
          
        if (error) {
          console.error("[SECURITY] Error storing upsell transaction:", error);
        } else {
          console.log("[SECURITY] Transaction stored successfully:", reference);
        }
      } catch (dbError) {
        console.error("[SECURITY] Database error:", dbError);
      }
    }

    // Always return transaction data for inline popup (no redirect)
    return new Response(
      JSON.stringify({ 
        success: true,
        access_code: paystackData.data.access_code,
        reference: reference,
        amount: productData.price,
        email: sanitizedEmail,
        public_key: 'pk_live_4d0939de823de47bc4c580f73f30accbb2d39c89',
        callback_url: redirectUrl
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[SECURITY] Upsell function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
