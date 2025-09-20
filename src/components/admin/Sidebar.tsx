
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  LifeBuoy,
  Link as LinkIcon,
  Settings,
  LogOut,
  User,
  Users,
  ShoppingCart,
  Home,
  Truck,
  Tag,
  UserCheck,
  
  FileText,
  Send,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin/'
    },
    {
      title: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/admin/products'
    },
    {
      title: 'Orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/admin/orders'
    },
    {
      title: 'Order Bumps',
      icon: <LifeBuoy className="h-5 w-5" />,
      path: '/admin/order-bumps'
    },
    {
      title: 'Discount Codes',
      icon: <Tag className="h-5 w-5" />,
      path: '/admin/discount-codes'
    },
    {
      title: 'Upsell Links',
      icon: <LinkIcon className="h-5 w-5" />,
      path: '/admin/upsell-links'
    },
    {
      title: 'CRM',
      icon: <UserCheck className="h-5 w-5" />,
      path: '/admin/crm'
    },
    {
      title: 'Customer Tags',
      icon: <Tag className="h-5 w-5" />,
      path: '/admin/customer-tags'
    },
    {
      title: 'Email Templates',
      icon: <FileText className="h-5 w-5" />,
      path: '/admin/email-templates'
    },
    {
      title: 'Email Campaigns',
      icon: <Send className="h-5 w-5" />,
      path: '/admin/email-campaigns'
    },
    {
      title: 'Invoices',
      icon: <Receipt className="h-5 w-5" />,
      path: '/admin/invoices'
    },
    {
      title: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      title: 'Shipping Settings',
      icon: <Truck className="h-5 w-5" />,
      path: '/admin/shipping-settings'
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings'
    },
    
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Fallback navigation in case hard reload is blocked
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="bg-gray-900 w-full sm:w-64 min-h-full border-r border-gray-800 flex flex-col">
      <div className="p-2 sm:p-4 border-b border-gray-800">
        <Link to="/">
          <div className="logo-cube-perspective">
            <div className="logo-cube">
              <div className="cube-face cube-face-front">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
              </div>
              <div className="cube-face cube-face-back">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
              </div>
              <div className="cube-face cube-face-right">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
              </div>
              <div className="cube-face cube-face-left">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
              </div>
              <div className="cube-face cube-face-top">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
              </div>
              <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
            </div>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 py-4 sm:py-6 px-2 sm:px-3 space-y-1">
        <Link
          to="/"
          className="flex items-center space-x-3 px-2 sm:px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 mb-4"
        >
          <Home className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={item.path}
              className={`flex items-center space-x-3 px-2 sm:px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-lemon-900 text-lemon-400 lemon-glow'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
      
      {currentUser && (
        <div className="p-2 sm:p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 px-2 sm:px-4 py-2 text-sm text-gray-400">
            <User className="h-5 w-5 text-gray-500" />
            <span className="truncate">{currentUser.email}</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-2 text-red-400 hover:text-red-500 hover:bg-red-900 justify-start"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .logo-cube-perspective {
          perspective: 800px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .logo-cube {
          width: 56px;
          height: 56px;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-rotate 3.5s linear infinite;
        }

        .cube-face {
          position: absolute;
          width: 56px;
          height: 56px;
          background: rgba(100, 116, 139, 0.7);
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(100, 116, 139, 0.2);
        }

        .cube-face-front  { transform: rotateY(0deg) translateZ(28px); }
        .cube-face-back   { transform: rotateY(180deg) translateZ(28px); }
        .cube-face-right  { transform: rotateY(90deg) translateZ(28px); }
        .cube-face-left   { transform: rotateY(-90deg) translateZ(28px); }
        .cube-face-top    { transform: rotateX(90deg) translateZ(28px); }
        .cube-face-bottom { transform: rotateX(-90deg) translateZ(28px); }

        .cube-logo {
          width: 36px;
          height: 36px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
          background: white;
        }

        @keyframes cube-rotate {
          0%   { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        `
      }} />
    </div>
  );
};

export default Sidebar;
