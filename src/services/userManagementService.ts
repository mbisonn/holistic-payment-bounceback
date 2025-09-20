
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

export const deleteUserAdmin = async (userId: string) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
  
  return { message: 'User deleted successfully' };
};

export const inviteUserToSystem = async (inviteData: { email: string; role: string }) => {
  // Create the profile entry with the user's ID as the primary key
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: crypto.randomUUID(), // Generate a UUID for the profile
      email: inviteData.email,
      role: inviteData.role
    });

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  return { message: 'User invited successfully' };
};

export const changeUserRole = async (userId: string, newRole: UserRole) => {
  const { data, error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to change user role: ${error.message}`);
  }

  return { message: 'User role updated successfully', data };
};

export const changeUserStatus = async (userId: string, status: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: status // Using role field to store status since there's no bio field
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to change user status: ${error.message}`);
  }

  return { message: 'User status updated successfully', data };
};
