
import { useEffect, useState } from 'react';
import AdminLoginCard from '@/components/admin/auth/AdminLoginCard';
import { supabase } from '@/integrations/supabase/client';

// Clear authentication storage
const clearAuthStorage = () => {
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.clear();
};

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize component - clear any stale auth state
  useEffect(() => {
    const initialize = async () => {
      try {
        setError(null);
        // Clear any existing auth state
        await supabase.auth.signOut({ scope: 'global' });
        clearAuthStorage();
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize login. Please refresh the page.');
      } finally {
        // Always set initialized to true, even if there's an error
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  // Handle login success
  const handleLoginSuccess = async () => {
    try {
      console.log('=== LOGIN SUCCESS HANDLER CALLED ===');
      
      // Simple immediate redirect - let ProtectedRoute handle auth validation
      console.log('Redirecting to /admin/dashboard immediately...');
      window.location.replace('/admin/');
      
    } catch (error) {
      console.error('Login success error:', error);
      // Force redirect even on error
      window.location.replace('/admin/');
    }
  };

  // Handle login start
  const handleLoginStart = () => {
    setError(null);
  };

  // Handle login error
  const handleLoginError = (errMsg: string) => {
    setError(errMsg);
  };

  // Auto-send magic link to the admin email on visit (optional, gated by env)
  useEffect(() => {
    const flag = import.meta.env.VITE_AUTO_MAGIC_LINK as string | undefined;
    if (!flag || flag.toString() !== 'true') return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) return;
      
      const sent = (window as any).__AUTO_MAGIC_LINK_SENT__;
      if (sent) return;
      (window as any).__AUTO_MAGIC_LINK_SENT__ = true;

      const email = 'ebuchenna1@gmail.com';
      const redirectTo = `${window.location.origin}/admin/login`;

      (async () => {
        try {
          await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
          });
          console.log('Magic link sent to', email);
        } catch (e) {
          console.warn('Failed to send magic link:', e);
        }
      })();
    });
  }, []);

  // Handle redirect after successful login - removed conflicting logic

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4"></div>
          <div className="text-bright text-lg">Initializing...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <div className="flex gap-3 justify-center">
            <button 
              className="glass-button px-6 py-2"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <AdminLoginCard 
          onSuccess={handleLoginSuccess}
          onStart={handleLoginStart}
          onError={handleLoginError}
        />
      </div>
    </div>
  );
}
