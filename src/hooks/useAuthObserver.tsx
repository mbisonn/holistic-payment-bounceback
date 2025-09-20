
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuthObserver = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        setSession(session);
        setCurrentUser(session?.user || null);
        
        // Check if user has admin role
        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user || null);
      
      // Check admin role
      if (session?.user) {
        await checkAdminRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check if user has admin role
  const checkAdminRole = async (userId: string) => {
    try {
      console.log('Checking admin role for user:', userId);
      
      // Prefer JWT role claim first
      const { data: userData } = await supabase.auth.getUser();
      const jwtRole = (userData?.user as any)?.app_metadata?.role || (userData?.user as any)?.role;
      if (jwtRole === 'admin') {
        setIsAdmin(true);
        return;
      }

      // Fallback: check user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }
      
      console.log('Admin role check result:', !!data);
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };
  
  return { session, currentUser, loading, isAdmin };
};
