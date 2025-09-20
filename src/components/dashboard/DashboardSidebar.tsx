import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  Mail, 
  ChevronLeft,
  ChevronRight,
  Zap,
  Tag,
  TrendingUp,
  Plus
} from 'lucide-react';
import { DashboardSection } from '@/pages/Dashboard';

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'upsells', label: 'Upsell/Downsell', icon: TrendingUp },
  { id: 'order-bumps', label: 'Order Bumps', icon: Plus },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
  { id: 'email-outbox', label: 'Email Outbox', icon: Mail },
  { id: 'meal-plan-sync', label: 'Meal Plan Sync', icon: Package },
  { id: 'discounts', label: 'Discounts', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'user-center', label: 'User Center', icon: Users },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
}) => {
  return (
    <motion.div
      className={`fixed left-0 top-0 h-full glass-card border-r border-white/20 shadow-lg z-30 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Dashboard</span>
          </motion.div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="glass-button-outline p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id as DashboardSection)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default DashboardSidebar;