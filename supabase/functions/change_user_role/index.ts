// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const { user_id, role } = await req.json();
    if (!user_id || !role) {
      return new Response(JSON.stringify({ error: 'user_id and role are required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Identify caller
    const token = authHeader.replace('Bearer ', '');
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }
    const callerId = userRes.user.id;

    // Load caller roles
    const { data: callerRoles, error: roleErr } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId);
    if (roleErr) {
      return new Response(JSON.stringify({ error: 'Failed to load caller roles' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    const hasRole = (r: string) => (callerRoles || []).some(cr => cr.role === r);
    const isAdmin = hasRole('admin');
    const isVerified = hasRole('verified') || isAdmin;

    // Authorization rules:
    // - Only admins can grant/revoke 'admin'
    // - Verified users (or admins) can grant 'verified' to others
    // - No self-verification to avoid abuse
    if (role === 'admin' && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Only admins can assign admin role' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
    }
    if (role === 'verified') {
      if (!isVerified) {
        return new Response(JSON.stringify({ error: 'Only verified users can verify others' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
      }
      if (callerId === user_id) {
        return new Response(JSON.stringify({ error: 'Self-verification is not allowed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }
    }

    // Upsert role for target user
    const { error } = await admin
      .from('user_roles')
      .upsert([{ user_id, role }], { onConflict: 'user_id,role' });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});