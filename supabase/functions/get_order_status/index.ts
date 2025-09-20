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

  let params;
  try {
    params = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
  }

  const { orderId, email } = params;
  if (!orderId && !email) {
    return new Response(JSON.stringify({ error: 'orderId or email required' }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let query = supabase.from('orders').select('*');
  if (orderId) {
    query = query.eq('id', orderId);
  } else if (email) {
    query = query.eq('customer_info->>email', email);
  }

  const { data, error } = await query.limit(1);
  if (error || !data || data.length === 0) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ order: data[0] }), { status: 200, headers: corsHeaders });
}); 