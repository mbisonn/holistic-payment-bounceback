
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 })
  }

  try {
    // Get the request body
    const { email, firstName, lastName, adminType, forceInvite } = await req.json()
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
    
    // Check if this is the default admin email
    const isDefaultAdmin = email.toLowerCase() === 'ebuchenna1@gmail.com'
    
    // Check authentication for non-default admin emails
    const authHeader = req.headers.get('Authorization')
    
    if (!isDefaultAdmin && !authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }

    // Create a Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('Creating admin client for user role management');
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin (except for default admin)
    if (!isDefaultAdmin && authHeader) {
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
        return new Response(JSON.stringify({ error: 'Insufficient privileges. Only admins can create admin users.' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
      }
    }
    
    let userId;
    let isNewUser = false;
    let emailSent = false;
    let userAlreadyExists = false;
    let alreadyAdmin = false;
    
    // Check if user exists by email
    console.log(`Looking up user with email: ${email}`);
    const { data: userList, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (getUserError) {
      console.error('Error looking up user:', getUserError);
      return new Response(JSON.stringify({ error: 'Error looking up user' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    
    // If user exists, get their ID, otherwise create a new user
    if (userList && userList.users && userList.users.length > 0) {
      userId = userList.users[0].id;
      userAlreadyExists = true;
      console.log(`User ${email} found with ID: ${userId}`);
      
      // Check if user already has admin role
      const { data: existingRoles, error: roleCheckError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', adminType || 'admin');
        
      if (!roleCheckError && existingRoles && existingRoles.length > 0) {
        alreadyAdmin = true;
        console.log(`User ${userId} already has ${adminType || 'admin'} role`);
        
        // If not forcing invite and user already has admin role, just return success
        if (!forceInvite) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `User already has admin access`,
              isNewUser: false,
              userAlreadyExists: true,
              alreadyAdmin: true,
              userId: userId,
              adminType: adminType || 'admin',
              emailSent: false
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      // For existing users, send them an invitation email if forceInvite is true
      if (forceInvite && !isDefaultAdmin) {
        console.log(`Force inviting existing user ${email}`);
        try {
          const baseUrl = 'https://a9488cd9-bc67-4432-a7e0-8952907b75f5.lovableproject.com';
          const redirectTo = `${baseUrl}/admin/login`;
          
          const userMetadata = {
            firstName: firstName || '',
            lastName: lastName || '',
            name: `${firstName || ''} ${lastName || ''}`.trim() || 'Admin User',
            adminType: adminType || 'admin',
            is_admin: true
          };
          
          // Send password reset email as invitation for existing users
          const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
              redirectTo: redirectTo
            }
          });
          
          if (resetError) {
            console.error('Error sending password reset email:', resetError);
          } else {
            emailSent = true;
            console.log(`Password reset/invitation email sent to ${email}`);
          }
        } catch (inviteError) {
          console.error('Error sending invitation to existing user:', inviteError);
        }
      }
    } else {
      console.log(`User ${email} not found, creating new admin account`);
      try {
        // Create user metadata with the provided information
        const userMetadata = {
          firstName: firstName || '',
          lastName: lastName || '',
          name: `${firstName || ''} ${lastName || ''}`.trim() || 'Admin User',
          adminType: adminType || 'admin',
          is_admin: true
        };

        // Set a default password for the default admin user
        if (isDefaultAdmin) {
          const createUserOptions = {
            email,
            password: Deno.env.get('DEFAULT_ADMIN_PASSWORD') || 'Admin123!@#',
            email_confirm: true, // Default admin doesn't need verification
            user_metadata: userMetadata
          };
          
          const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(createUserOptions);
          
          if (createUserError) {
            console.error('Error creating user:', createUserError);
            return new Response(JSON.stringify({ error: 'Failed to create user: ' + createUserError.message }), 
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
          }
          
          userId = newUser.user.id;
          isNewUser = true;
          console.log(`Created new user with ID: ${userId}`);
        } else {
          // For non-default admins, invite them with proper redirect URL
          console.log('Inviting user via email...');
          
          // Use the current application URL for redirect
          const baseUrl = 'https://a9488cd9-bc67-4432-a7e0-8952907b75f5.lovableproject.com';
          const redirectTo = `${baseUrl}/admin/login`;
          
          console.log(`Sending invitation to ${email} with redirect to ${redirectTo}`);
          
          const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectTo,
            data: userMetadata
          });
          
          if (inviteError) {
            console.error('Error inviting user:', inviteError);
            // Log specific error details for SMTP issues
            if (inviteError.message && inviteError.message.includes('SMTP')) {
              console.error('SMTP configuration issue detected:', inviteError.message);
            }
            return new Response(JSON.stringify({ 
              error: 'Failed to invite user: ' + inviteError.message,
              smtpIssue: inviteError.message && inviteError.message.includes('SMTP')
            }), 
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
          }
          
          userId = inviteData.user.id;
          isNewUser = true;
          emailSent = true;
          console.log(`Successfully invited user with ID: ${userId}, invitation email sent to ${email}`);
        }
      } catch (createError) {
        console.error('Exception creating user:', createError);
        return new Response(JSON.stringify({ error: 'Failed to create user: ' + createError.message }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
      }
    }
    
    // If user doesn't have the specified role yet, assign it
    if (!alreadyAdmin) {
      console.log(`Assigning ${adminType || 'admin'} role to user ${userId}`);
      
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: adminType || 'admin' });
      
      if (insertError) {
        console.error('Error assigning admin role:', insertError);
        
        // Special handling for the default admin user
        if (!isDefaultAdmin) {
          return new Response(JSON.stringify({ error: 'Failed to assign admin role: ' + insertError.message }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
        }
        // For default admin, continue despite errors
      }
    }
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Admin user ${isNewUser ? 'invited' : userAlreadyExists ? 'updated' : 'created'} successfully`,
        isNewUser: isNewUser,
        userAlreadyExists: userAlreadyExists,
        alreadyAdmin: alreadyAdmin,
        userId: userId,
        adminType: adminType || 'admin',
        emailSent: emailSent,
        redirectUrl: (isNewUser || forceInvite) && !isDefaultAdmin ? 'https://a9488cd9-bc67-4432-a7e0-8952907b75f5.lovableproject.com/admin/login' : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create_user_role function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
