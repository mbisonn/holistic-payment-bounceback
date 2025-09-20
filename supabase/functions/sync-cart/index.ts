import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Rate limiting
const rateLimitStore = new Map();
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const limit = 10; // 10 requests per minute
  
  const key = `${ip}_${Math.floor(now / windowMs)}`;
  const current = rateLimitStore.get(key) || 0;
  
  if (current >= limit) {
    return false;
  }
  
  rateLimitStore.set(key, current + 1);
  return true;
};

// Input validation
const validateCartItem = (item: any) => {
  if (!item || typeof item !== 'object') return false;
  if (!item.sku || typeof item.sku !== 'string' || item.sku.length > 50) return false;
  if (!item.name || typeof item.name !== 'string' || item.name.length > 200) return false;
  if (typeof item.price !== 'number' || item.price <= 0 || item.price > 10000000) return false;
  if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) return false;
  return true;
};

const validateCustomerInfo = (info: any) => {
  if (!info || typeof info !== 'object') return false;
  if (!info.email || typeof info.email !== 'string' || !info.email.includes('@')) return false;
  if (!info.name || typeof info.name !== 'string' || info.name.length > 100) return false;
  return true;
};

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"'&]/g, '').substring(0, 200);
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
    'https://www.teneraholisticandwellness.com'
  ];

  // Define CORS headers for preflight OPTIONS requests
  const preflightCorsHeaders = {
    'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: preflightCorsHeaders, status: 204 });
  }

  // Define CORS headers for actual requests (POST)
  const actualCorsHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : '*',
  };

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { headers: actualCorsHeaders, status: 429 }
      );
    }

    // Origin validation: This will handle actual POST requests.
    if (origin && !allowedOrigins.includes(origin)) {
      console.log(`[SECURITY] Invalid origin: ${origin}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid origin' }),
        { headers: actualCorsHeaders, status: 403 }
      );
    }

    const { cartItems, customerInfo } = await req.json();
    
    console.log('[SECURITY] Cart sync request received');
    
    // Validate input
    if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid cart data' }),
        { headers: actualCorsHeaders, status: 400 }
      );
    }

    if (!validateCustomerInfo(customerInfo)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid customer information' }),
        { headers: actualCorsHeaders, status: 400 }
      );
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!validateCartItem(item)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid cart item data' }),
          { headers: actualCorsHeaders, status: 400 }
        );
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize and normalize cart items
    const syncedItems = cartItems.map(item => ({
      id: sanitizeString(item.sku || item.id),
      sku: sanitizeString(item.sku || item.id),
      name: sanitizeString(item.name),
      price: Math.max(0, Math.min(10000000, parseFloat(item.price))),
      quantity: Math.max(1, Math.min(100, parseInt(item.quantity))),
      image: item.image || '/placeholder.svg',
      category: item.category ? sanitizeString(item.category) : 'wellness'
    }));

    // Calculate total in Naira
    const totalAmount = syncedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    // Sanitize customer info
    const sanitizedCustomerInfo = {
      name: sanitizeString(customerInfo.name),
      email: customerInfo.email.toLowerCase().trim(),
      phone: customerInfo.phone ? sanitizeString(customerInfo.phone) : null,
    };

    // Store the synced cart data with proper validation
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        items: syncedItems,
        total_amount: Math.round(totalAmount * 100), // Convert to kobo
        customer_info: sanitizedCustomerInfo,
        status: 'pending',
        source: 'cart_sync'
      })
      .select()
      .single();

    if (error) {
      console.error('[SECURITY] Error storing cart:', error);
      throw error;
    }

    console.log('[SECURITY] Cart synced successfully with order ID:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        syncedItems,
        totalAmount: totalAmount,
        currency: 'NGN'
      }),
      { headers: actualCorsHeaders }
    );

  } catch (error) {
    console.error('[SECURITY] Sync cart error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { headers: actualCorsHeaders, status: 500 }
    );
  }
});
