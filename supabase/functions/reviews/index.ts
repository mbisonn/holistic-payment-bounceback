import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
    }
    const { product_id, user_name, rating, review } = body;
    if (!product_id || !user_name || !rating || !review) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: corsHeaders });
    }
    const { data, error } = await supabase.from('product_reviews').insert([{ product_id, user_name, rating, review }]);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true, review: data }), { status: 201, headers: corsHeaders });
  }

  // GET: fetch reviews for a product
  const url = new URL(req.url);
  const product_id = url.searchParams.get('product_id');
  if (!product_id) {
    return new Response(JSON.stringify({ error: 'product_id required' }), { status: 400, headers: corsHeaders });
  }
  const { data, error } = await supabase.from('product_reviews').select('*').eq('product_id', product_id).order('created_at', { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ reviews: data }), { status: 200, headers: corsHeaders });
}); 