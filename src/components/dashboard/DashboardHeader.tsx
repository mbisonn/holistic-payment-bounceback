
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
  Truck,
  Star,
  Zap,
  Tag,
  TrendingUp,
  ArrowDownCircle,
  Menu,
  Search,
  Bell,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/pages/Dashboard';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  activeSection: DashboardSection;
  onToggleSidebar: () => void;
  setActiveSection: (section: DashboardSection) => void;
}

const sectionTitles: Record<string, string> = {
  overview: 'Dashboard Overview',
  products: 'Products Management',
  orders: 'Orders Management',
  customers: 'Customer Management',
  upsells: 'Upsells',
  downsells: 'Downsells',
  tags: 'Tags',
  automations: 'Automations',
  'workflow-builder': 'Workflow Builder',
  'email-analytics': 'Email Analytics',
  analytics: 'Analytics & Reports',
  'email-campaigns': 'Email Campaigns',
  shipping: 'Shipping Settings',
  reviews: 'Product Reviews',
  settings: 'Settings',
  'order-bumps': 'Order Bumps',
  'meal-plan-sync': 'Meal Plan Sync',
  discounts: 'Discounts',
};

const sectionIcons: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  products: Package,
  orders: ShoppingBag,
  customers: Users,
  upsells: TrendingUp,
  downsells: ArrowDownCircle,
  tags: Tag,
  automations: Zap,
  'workflow-builder': Zap,
  'email-analytics': BarChart3,
  analytics: BarChart3,
  'email-campaigns': Mail,
  shipping: Truck,
  reviews: Star,
  settings: Settings,
  'order-bumps': Package,
  'meal-plan-sync': Package,
  discounts: Tag,
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeSection,
  onToggleSidebar,
  setActiveSection,
}) => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New order received', time: '2 minutes ago', read: false },
    { id: 2, title: 'Product stock low', time: '10 minutes ago', read: false },
    { id: 3, title: 'New user registered', time: '1 hour ago', read: false },
  ]);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.user_metadata?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setEditName(currentUser?.user_metadata?.name || '');
    setEditEmail(currentUser?.email || '');
  }, [currentUser]);

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => setNotifications([]);
  const handleViewAll = () => {
    toast({ title: 'Coming soon', description: 'A full notifications page will be available soon.' });
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: editName },
        email: editEmail !== currentUser?.email ? editEmail : undefined,
      });

      if (error) throw error;

      setEditOpen(false);
    } catch (error: any) {
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const ActiveIcon = sectionIcons[activeSection] || LayoutDashboard;
  const title = sectionTitles[activeSection] || 'Dashboard';

  return (
    <motion.header
      className="glass-card border-b border-white/20 px-4 sm:px-6 py-4 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Section title and toggle button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="sm"
            className="glass-button-outline p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <ActiveIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
              <p className="text-sm text-gray-300 hidden sm:block">
                Manage your {activeSection.replace('-', ' ')} efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Search, notifications, and user menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Hidden on mobile */}
          <div className="hidden sm:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 glass-input text-white border-white/20"
            />
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="glass-button-outline relative">
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="glass-card w-80 p-0 border-white/20 animate-fade-in">
              <div className="p-4 border-b border-white/10 font-semibold text-white flex justify-between items-center">
                <span>Notifications</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-red-400 p-0 h-auto hover:text-red-300" 
                  onClick={handleClearAll} 
                  disabled={notifications.length === 0}
                >
                  Clear all
                </Button>
              </div>
              <ul className="divide-y divide-white/10 max-h-60 overflow-y-auto">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4 hover:bg-white/5 cursor-pointer" onClick={() => handleNotificationClick(notification.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-2 text-center">
                <Button 
                  variant="link" 
                  className="text-green-400 hover:text-green-300" 
                  onClick={handleViewAll} 
                  disabled={notifications.length === 0}
                >
                  View all
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="glass-button-outline">
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{currentUser?.user_metadata?.name || currentUser?.email}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="glass-card w-56 p-0 border-white/20 animate-fade-in">
              <div className="p-4 border-b border-white/10">
                <p className="text-sm font-medium text-white">{currentUser?.user_metadata?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{currentUser?.email}</p>
              </div>
              <ul className="p-2">
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-white/10" 
                    onClick={() => setEditOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-white/10" 
                    onClick={() => setActiveSection('user-center')}
                  >
                    User Center
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                    onClick={async () => {
                      try {
                        console.log('DashboardHeader logout button clicked');
                        await logout();
                        // The logout function should handle the redirect, but we'll add a fallback
                        setTimeout(() => {
                          try { 
                            window.location.replace('/admin/login'); 
                          } catch { 
                            window.location.href = '/admin/login'; 
                          }
                        }, 1000);
                      } catch (error) {
                        console.error('Logout error in DashboardHeader:', error);
                        // Force redirect even if logout fails
                        try { 
                          window.location.replace('/admin/login'); 
                        } catch { 
                          window.location.href = '/admin/login'; 
                        }
                      }
                    }}
                  >
                    Logout
                  </Button>
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-card glass-modal modal-content max-w-md animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="glass-input text-white border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="glass-input text-white border-white/20"
              />
            </div>
            {editError && (
              <p className="text-red-400 text-sm">{editError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditOpen(false)}
                className="glass-button-outline"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading} className="glass-button">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
};

export default DashboardHeader;
