import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);

      // Check user_roles table for admin role - don't use cache during debugging
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      const hasAdminRole = userRoles && userRoles.length > 0;
      console.log('Admin check result:', hasAdminRole, 'Roles found:', userRoles);
      
      setIsAdmin(hasAdminRole);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session with retry logic
    const getInitialSession = async (retryCount = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Retry once on network errors
          if (retryCount === 0 && error.message.includes('network')) {
            timeoutId = setTimeout(() => getInitialSession(1), 1000);
            return;
          }
          if (mounted) {
            setError(error.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          setError(null);
          // Small delay to ensure UI is ready
          timeoutId = setTimeout(() => {
            if (mounted) checkAdminStatus(session.user.id);
          }, 100);
        } else if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setError(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setError('Failed to get initial session');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user: User } | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        try {
          if (session?.user) {
            setUser(session.user);
            setError(null);
            
            // Always check admin status after login to ensure fresh data
            timeoutId = setTimeout(() => {
              if (mounted) checkAdminStatus(session.user.id);
            }, 500);
            
            // Store session persistence flag
            localStorage.setItem('supabase.auth.token', 'persisted');
          } else {
            setUser(null);
            setIsAdmin(false);
            setError(null);
            
            // Clear cache and persistence flag on logout
            localStorage.removeItem('supabase.auth.token');
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
              if (key.startsWith('isAdmin:')) {
                sessionStorage.removeItem(key);
              }
            });
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (mounted) {
            setError('Authentication state change failed');
          }
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isAdmin,
    error
  };
};