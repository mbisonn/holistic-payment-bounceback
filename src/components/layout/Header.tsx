import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="lg:hidden px-4 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-colors"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-sm">
                Bounce back to life Consult
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Dashboard</span>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  navigate('/admin/login', { replace: true });
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}