// @ts-nocheck
// Supabase Edge Function: list-auth-users
// Lists auth users using service role with pagination and search

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

type ReqBody = {
  page?: number;
  per_page?: number;
  search?: string; // optional email search
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 405 
    });
  }

  try {
    const SUPABASE_URL =
      Deno.env.get('SUPABASE_URL') ||
      Deno.env.get('PROJECT_URL') ||
      Deno.env.get('SB_URL') ||
      '';
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SB_SERVICE_ROLE_KEY') ||
      '';
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      });
    }

    const { page = 1, per_page = 1000, search = '' } = (await req.json().catch(() => ({}))) as ReqBody;

    console.log(`Fetching users - page: ${page}, per_page: ${per_page}, search: ${search}`);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Use admin API to list users with pagination
    const { data, error } = await admin.auth.admin.listUsers({ 
      page, 
      perPage: per_page 
    });
    
    if (error) {
      console.error('Error listing users:', error);
      throw error;
    }

    let users = data.users || [];
    console.log(`Retrieved ${users.length} users from Supabase`);

    // Apply search filter if provided
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u: any) => 
        (u.email || '').toLowerCase().includes(q) ||
        (u.user_metadata?.name || '').toLowerCase().includes(q)
      );
      console.log(`Filtered to ${users.length} users matching search: ${search}`);
    }

    // Transform users to include only necessary fields
    const results = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      user_metadata: u.user_metadata || {},
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      phone: u.phone,
      app_metadata: u.app_metadata || {}
    }));

    console.log(`Returning ${results.length} users`);

    return new Response(JSON.stringify({ 
      users: results, 
      page, 
      per_page,
      total: results.length,
      has_more: users.length === per_page // Indicates if there might be more pages
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });
  } catch (e) {
    console.error('list-auth-users error:', e);
    return new Response(JSON.stringify({ 
      error: String(e?.message || e),
      details: e?.toString()
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});
