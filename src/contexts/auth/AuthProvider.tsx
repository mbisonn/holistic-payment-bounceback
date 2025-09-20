
import React from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from '@/integrations/supabase/client';
import { checkClientRateLimit } from '@/utils/securityEnhancements';
import { useToast } from '@/hooks/use-toast';
// timeout-retry behavior removed

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuthState();
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      // Enhanced security: rate limiting check
      if (!checkClientRateLimit(`signin_${email}`, 5, 15 * 60 * 1000)) {
        return { success: false, error: 'Too many sign-in attempts. Please try again later.' };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      setError(null);

      // Clear any stale admin cache and refresh session so useAuthState re-checks immediately
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (uid) {
          try { sessionStorage.removeItem(`isAdmin:${uid}`); } catch {}
        }
        // Optionally refresh session; no timeout wrapper
        await supabase.auth.getSession();
      } catch {}

      return { success: true };
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      if (!email) return { success: false, error: 'Email is required' };

      // Optional: guard against rapid spamming
      if (!checkClientRateLimit(`resend_${email}`, 3, 10 * 60 * 1000)) {
        return { success: false, error: 'Please wait before requesting another email.' };
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      } as any);

      if (error) {
        toast({ title: 'Verification email', description: error.message, variant: 'destructive' });
        return { success: false, error: error.message };
      }

      toast({ title: 'Verification email sent', description: `Check ${email} (and spam folder).` });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to resend verification' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Enhanced security: validate email redirect URL
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    // Keep as a lightweight sign out without redirect
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      // swallow signOut errors
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear error state
      setError(null);
      
      // Sign out from Supabase first (this will clear auth tokens)
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear specific auth-related storage items
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Clear any cached admin status
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('isAdmin:')) {
          sessionStorage.removeItem(key);
        }
      });
      
      toast({ 
        title: 'Logged out successfully', 
        description: 'You have been logged out', 
        variant: 'default' 
      });
      
      // Use navigate instead of window.location.replace for better SPA behavior
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 100);
      
    } catch (err: any) {
      console.error('Logout error:', err);
      
      // Force logout even if Supabase fails
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      toast({ 
        title: 'Logged out', 
        description: 'You have been logged out', 
        variant: 'default' 
      });
      
      // Force redirect
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 100);
    }
  };

  const hasRole = async (role: string) => {
    if (!user) return false;
    
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role as 'admin' | 'user' | 'moderator')
      .single();
    
    return !!userRole;
  };

  const authValue = {
    user,
    currentUser: user,
    session: null,
    loading,
    isAdmin,
    signIn,
    signUp,
    resendVerification,
    signOut,
    logout,
    hasRole,
    error, // expose error in context
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {error}
        </div>
      )}
    </AuthContext.Provider>
  );
};
