
import { useEffect, ReactNode, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';
import { Header } from '../layout/Header';
import DashboardErrorBoundary from '../dashboard/DashboardErrorBoundary';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Removed auto sign-out on refresh to prevent access issues
  
  // Enhanced auth check with persistence
  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (!currentUser) {
        // Check if we have a persisted session before redirecting
        const hasPersistedAuth = localStorage.getItem('supabase.auth.token');
        if (!hasPersistedAuth) {
          navigate('/admin/login');
        }
      }
    }
  }, [currentUser, loading, navigate, hasCheckedAuth]);

  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardErrorBoundary>
      <div className="flex h-screen bg-gray-950">
        {/* Sidebar for desktop, slide-in for mobile */}
        <div className="hidden sm:block h-full">
          <Sidebar />
        </div>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            {/* Overlay first, z-40 */}
            <div
              className="fixed inset-0 bg-black bg-opacity-60 z-40"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar overlay"
            />
            {/* Sidebar above overlay, z-50 */}
            <div className="fixed inset-y-0 left-0 w-64 h-full bg-gray-900 shadow-xl z-50">
              <Sidebar />
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
          </>
        )}
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default AdminLayout;
