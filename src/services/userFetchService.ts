
import { supabase } from '@/integrations/supabase/client';

export interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
  };
  is_admin?: boolean;
  roles?: string[];
}

export const fetchAllUsers = async (isAdmin: boolean): Promise<UserWithRoles[]> => {
  if (!isAdmin) {
    throw new Error('Access denied. Admin privileges required.');
  }

  try {
    // Fetch users from profiles table and left join with user_roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `);

    if (profilesError) throw profilesError;

    // Transform the data to match UserWithRoles interface
    const users: UserWithRoles[] = (profiles || []).map(profile => {
      const userRoles = Array.isArray(profile.user_roles) ? profile.user_roles : [profile.user_roles];
      const roles = userRoles.filter(r => r?.role).map(r => r.role);
      const isAdmin = roles.includes('admin');
      
      return {
        id: profile.id,
        email: profile.email || '',
        created_at: profile.created_at || '',
        last_sign_in_at: null,
        user_metadata: {
          name: profile.full_name || undefined
        },
        is_admin: isAdmin,
        roles: roles
      };
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUsers = fetchAllUsers;

export const fetchUserById = async (userId: string): Promise<UserWithRoles | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(role)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email || '',
      created_at: profile.created_at || '',
      last_sign_in_at: null,
      user_metadata: {
        name: profile.full_name || undefined
      },
      is_admin: (profile.user_roles as any)?.role === 'admin',
      roles: (profile.user_roles as any)?.role ? [(profile.user_roles as any).role] : []
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: role as any })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
