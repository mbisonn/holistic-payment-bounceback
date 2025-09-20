import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  recentOrders: any[];
  topProducts: any[];
}

const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch unique customers
      const { data: customers, error: customersError } = await supabase
        .from('orders')
        .select('customer_email')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      const uniqueCustomers = new Set(customers?.map(c => c.customer_email) || []).size;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;

      setAnalytics({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        avgOrderValue,
        recentOrders: orders?.slice(0, 5) || [],
        topProducts: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₦{analytics.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₦{analytics.avgOrderValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription className="text-white/70">Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium text-white">{order.customer_name}</p>
                  <p className="text-sm text-white/70">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">₦{order.total_amount.toLocaleString()}</p>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;