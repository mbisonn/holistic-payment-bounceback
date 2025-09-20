
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";

// Checklist for debugging/fixing Supabase roles and RLS:
// 1. Ensure the has_role function exists and works: select public.has_role('<user-uuid>', 'admin');
// 2. Ensure the user is assigned the 'admin' role in the user_roles table.
// 3. Test RLS policies by running queries as the user.
// 4. Review RLS policy logic for correct use of has_role and auth.uid().

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create authenticated Supabase client using request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      // Supabase API URL and anon key - both are needed
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get requesting user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { method, pathname } = new URL(req.url);
    const path = pathname.split('/').filter(Boolean);
    
    // Handle different endpoints
    if (method === 'POST' && path[1] === 'grant') {
      // Grant admin role to a user
      const { userId } = await req.json();
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId in request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      // Check if caller is an admin
      const { data: adminCheck } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: 'Only admins can grant admin roles' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      // Grant role
      const { data, error } = await supabaseClient
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' })
        .select();
        
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } 
    else if (method === 'POST' && path[1] === 'revoke') {
      // Revoke admin role
      const { userId } = await req.json();
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId in request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      // Check if caller is an admin
      const { data: adminCheck } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: 'Only admins can revoke admin roles' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      // Revoke role
      const { error } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
        
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    else if (method === 'GET' && path[1] === 'check') {
      // Check if a user has admin role
      const userId = path[2] || user.id; // If no ID provided, check caller
      
      const { data, error } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ isAdmin: !!data }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Default response for unhandled routes
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
