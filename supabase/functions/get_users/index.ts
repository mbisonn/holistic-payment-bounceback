
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 })
  }

  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }

    // Create a Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('Creating admin client for user listing');
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }
    
    // Check if requesting user has admin role
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
      
    if (roleError || !userRoles || userRoles.length === 0) {
      return new Response(JSON.stringify({ error: 'Insufficient privileges. Only admins can view users.' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
    }
    
    // Get all users from auth.users
    console.log('Fetching all users...');
    const { data: users, error: getUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUsersError) {
      console.error('Error fetching users:', getUsersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    
    console.log(`Found ${users?.users?.length || 0} users`);
    
    // Return success with users
    return new Response(
      JSON.stringify({ 
        success: true, 
        users: users?.users || [],
        count: users?.users?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in get_users function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
