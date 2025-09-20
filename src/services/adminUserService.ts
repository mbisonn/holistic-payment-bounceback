
import { supabase } from '@/integrations/supabase/client';
import type { AddAdminUserData } from '@/types/user-management-types';

export const createAdminUser = async (userData: AddAdminUserData, isAdmin: boolean) => {
  if (!isAdmin) {
    throw new Error('Only administrators can create new admin users');
  }

  console.log('Creating admin user with data:', userData);
  
  // Call the edge function to create user with admin role
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('You must be logged in to perform this action');
  }
  
  const response = await fetch('https://xjfkeblnxyjhxukqurvc.supabase.co/functions/v1/create_user_role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ 
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      adminType: userData.adminType,
      forceInvite: true // Add flag to force sending invitation even for existing users
    })
  });
  
  const result = await response.json();
  console.log('Edge function result:', result);
  
  if (response.ok && result.success) {
    let message = '';
    
    if (result.userAlreadyExists && result.alreadyAdmin) {
      message = `User ${userData.email} already has admin access. No invitation needed.`;
    } else if (result.userAlreadyExists && result.emailSent) {
      message = `Admin role granted to existing user ${userData.email}. Invitation email sent.`;
    } else if (result.isNewUser && result.emailSent) {
      message = `New admin user invited successfully. Invitation email sent to ${userData.email}.`;
    } else if (result.isNewUser && !result.emailSent) {
      message = `Admin user created but invitation email failed. Please check SMTP configuration.`;
    } else {
      message = `Admin user processed successfully.`;
    }
    
    return { success: true, message };
  } else {
    throw new Error(result.error || 'Failed to create admin user');
  }
};

export const addAdminRoleToUser = async (email: string, isAdmin: boolean) => {
  if (!isAdmin) {
    throw new Error('Only administrators can grant admin roles');
  }

  // Use the edge function instead of RPC to avoid typing issues
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('You must be logged in to perform this action');
  }
  
  const response = await fetch('https://xjfkeblnxyjhxukqurvc.supabase.co/functions/v1/create_user_role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ email })
  });
  
  const result = await response.json();
  
  if (response.ok && result.success) {
    return { success: true, message: `Admin role added to ${email}` };
  } else {
    throw new Error(result.error || 'Failed to add admin role');
  }
};
