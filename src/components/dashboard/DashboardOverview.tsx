import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users, 
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  [key: string]: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  [key: string]: any;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const stopGuard = startLoadingGuard(setLoading, 10000);
    setError(null);
    
    try {
      // 1. Check session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.warn('No active session, using empty data:', sessionError?.message);
        updateDashboardState([], []);
        return;
      }

      // 2. Fetch data in parallel with proper typing
      type SupabaseResponse<T> = { data: T[] | null; error: any };
      
      const [ordersResponse, productsResponse] = await Promise.all([
        withTimeout<SupabaseResponse<Order>>(
          supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false }),
          10000
        ) as Promise<SupabaseResponse<Order>>,
        
        withTimeout<SupabaseResponse<Product>>(
          supabase.from('products').select('*'),
          10000
        ) as Promise<SupabaseResponse<Product>>
      ]);

      // 3. Process results with null checks
      const orders = ordersResponse?.data || [];
      const products = productsResponse?.data || [];

      // 4. Update state with new data
      updateDashboardState(orders, products);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      stopGuard();
      setLoading(false);
    }
  }, []);

  // Memoized function to update dashboard state
  const updateDashboardState = useCallback((orders: Order[], products: Product[]) => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const uniqueCustomers = new Set(orders.map(order => order.customer_email)).size;

    setStats({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers: uniqueCustomers,
      revenueChange: 0, // TODO: Implement change calculation
      ordersChange: 0   // TODO: Implement change calculation
    });
    
    setRecentOrders(orders.slice(0, 5));
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [{
    title: 'Total Revenue',
    value: `₦${stats.totalRevenue.toLocaleString()}`,
    change: stats.revenueChange,
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600'
  }, {
    title: 'Total Orders',
    value: stats.totalOrders.toString(),
    change: stats.ordersChange,
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-600'
  }, {
    title: 'Total Products',
    value: stats.totalProducts.toString(),
    change: 0,
    icon: Package,
    color: 'from-purple-500 to-pink-600'
  }, {
    title: 'Total Customers',
    value: stats.totalCustomers.toString(),
    change: 0,
    icon: Users,
    color: 'from-orange-500 to-red-600'
  }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 glass-card animate-glass-float">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
          <p className="text-bright">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center glass-card">
        <div className="text-red-400 font-semibold mb-4">{error}</div>
        <Button
          onClick={fetchDashboardData}
          className="glass-button"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  {stat.change !== 0 && (
                    <div className="flex items-center mt-1">
                      {stat.change > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm ml-1 ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(stat.change)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 rounded-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">{order.customer_name || 'Guest'}</p>
                  <p className="text-sm text-gray-400">{order.customer_email || 'No email'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">₦{order.total_amount?.toLocaleString() || '0'}</p>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No recent orders found</p>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
