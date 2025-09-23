
import { useEffect, useState } from 'react';
import AdminLoginCard from '@/components/admin/auth/AdminLoginCard';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is already authenticated and redirect if admin
  useEffect(() => {
    if (loading || hasRedirected) return;
    
    if (user && isAdmin) {
      console.log('User already authenticated as admin, redirecting...');
      setHasRedirected(true);
      navigate('/admin/', { replace: true });
      return;
    }
    
    if (!loading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [user, isAdmin, loading, isInitialized, hasRedirected, navigate]);

  // Handle login success
  const handleLoginSuccess = async () => {
    try {
      console.log('=== LOGIN SUCCESS HANDLER CALLED ===');
      
      // Simple immediate redirect - let ProtectedRoute handle auth validation
      console.log('Redirecting to /admin/ immediately...');
      setHasRedirected(true);
      navigate('/admin/', { replace: true });
      
    } catch (error) {
      console.error('Login success error:', error);
      // Force redirect even on error
      setHasRedirected(true);
      navigate('/admin/', { replace: true });
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

  // Removed auto-magic link to prevent conflicts

  // Handle redirect after successful login - removed conflicting logic

  // Show loading state during initialization
  if (loading || !isInitialized) {
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
