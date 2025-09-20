import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users from auth.users
    const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }

    // Get profiles for all users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')

    if (profilesError) {
      throw profilesError
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('*')

    if (rolesError) {
      throw rolesError
    }

    // Combine user data with profiles and roles
    const enrichedUsers = users.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id)
      const roles = userRoles?.filter(r => r.user_id === user.id).map(r => r.role) || []
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
        role: profile?.role || 'user',
        roles: roles,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        is_active: user.banned_until === null
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedUsers,
        count: enrichedUsers.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
