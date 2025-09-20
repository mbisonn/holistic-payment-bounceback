import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    console.log('=== PROTECTED ROUTE CHECK ===');
    console.log('Loading:', loading);
    console.log('User:', user?.email || 'No user');
    console.log('IsAdmin:', isAdmin);
    
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }
      
      if (!isAdmin) {
        console.log('User is not admin, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }
      
      console.log('User is authenticated and admin, allowing access');
    }
  }, [user, loading, isAdmin]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4"></div>
          <div className="text-bright text-lg">Verifying Access...</div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
