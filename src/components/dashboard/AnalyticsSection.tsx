import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, RefreshCw, BarChart3, PieChart as PieChartIcon, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsExporter } from '@/components/admin/analytics/AnalyticsExporter';

const AnalyticsSection = () => {
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [emailAnalytics, setEmailAnalytics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const exportEmailAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('email_analytics')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const csvContent = "data:text/csv;charset=utf-8," 
        + "Email,Campaign,Sent At,Opened At,Clicked At,Status\n"
        + (data || []).map(row => 
          `${row.email_address},${row.campaign_id || 'N/A'},${row.sent_at || 'N/A'},${row.opened_at || 'N/A'},${row.clicked_at || 'N/A'},${row.opened_at ? 'Opened' : 'Sent'}`
        ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "email_analytics.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Email analytics exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export email analytics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Fire-and-forget to avoid blocking initial render
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch orders data
      const { data: orders, error: fetchError } = await supabase.from('orders').select('*');
      if (fetchError) throw fetchError;

      // Fetch email analytics data
      const { data: emailData, error: emailError } = await supabase
        .from('email_analytics')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (!emailError) {
        setEmailAnalytics(emailData || []);
      }

      // Process daily sales data
      const salesByDate = orders?.reduce((acc: any, order: any) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {}) || {};
      const dailySalesData = Object.entries(salesByDate).map(([date, sales]) => ({
        date,
        sales
      })).slice(-7); // Last 7 days

      setDailySales(dailySalesData);

      // Process order status data
      const statusCounts = orders?.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count
      }));
      setOrderStatus(statusData);

      // Compute top products from orders.items where available
      const productTotals: Record<string, { name: string; sales: number; revenue: number }> = {};
      (orders || []).forEach((order: any) => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((it: any) => {
          const key = it.product_id || it.id || it.name || 'Unknown';
          const name = it.name || key;
          const qty = Number(it.quantity || 1);
          const price = Number(it.price || 0);
          if (!productTotals[key]) {
            productTotals[key] = { name, sales: 0, revenue: 0 };
          }
          productTotals[key].sales += qty;
          productTotals[key].revenue += qty * price;
        });
      });
      const computedTop = Object.values(productTotals)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopProducts(computedTop);
    } catch (error: any) {
      // Non-fatal: log, set empty datasets
      setError(error.message || 'Failed to fetch analytics data');
      console.warn('Error fetching analytics data:', error);
      setDailySales([]);
      setOrderStatus([]);
      setTopProducts([]);
      setEmailAnalytics([]);
    } finally {
      // do not block UI on loading here
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchAnalyticsData(); }}>Retry</Button>
    </div>
  ) : null;

  return <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics & Email Analytics</h2>
        <p className="text-gray-300">Track your business performance and email campaigns</p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Button variant="outline" className="w-full sm:w-auto glass-button-outline" onClick={fetchAnalyticsData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" className="w-full sm:w-auto glass-button-outline" onClick={exportEmailAnalytics}>
          <Download className="w-4 h-4 mr-2" />
          Export Email Analytics
        </Button>
      </div>
    </div>
    {/* Inline error (non-blocking) */}
    {errorBanner}

    {/* Charts Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Daily Sales Chart */}
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <Card className="glass-card border-white/20">
            <CardHeader className="bg-white/5">
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5" />
                <span>Daily Sales (Last 7 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={value => [`₦${Number(value).toLocaleString()}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        {/* Order Status Distribution */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <Card className="glass-card border-white/20">
            <CardHeader className="bg-white/5">
              <CardTitle className="flex items-center space-x-2 text-white">
                <PieChartIcon className="w-5 h-5" />
                <span>Order Status Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={orderStatus} cx="50%" cy="50%" labelLine={false} label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {orderStatus.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Top Products */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }}>
        <Card className="glass-card border-white/20">
          <CardHeader className="bg-white/5">
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <span>Top Performing Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 font-medium text-white">Product</th>
                    <th className="text-left p-4 font-medium text-white">Sales</th>
                    <th className="text-left p-4 font-medium text-white">Revenue</th>
                    <th className="text-left p-4 font-medium text-white">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(product => <tr key={product.name} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4 font-medium text-white">{product.name}</td>
                      <td className="p-4 text-white">{product.sales}</td>
                      <td className="p-4 text-white">₦{product.revenue.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-semibold">
                          {(product.sales / 100 * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {[{
        title: 'Conversion Rate',
        value: '3.2%',
        change: '+0.5%',
        positive: true
      }, {
        title: 'Avg Order Value',
        value: '₦75,000',
        change: '+12%',
        positive: true
      }, {
        title: 'Customer Retention',
        value: '68%',
        change: '+5%',
        positive: true
      }, {
        title: 'Return Rate',
        value: '2.1%',
        change: '-0.3%',
        positive: false
      }].map((metric, index) => <motion.div key={metric.title} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4 + index * 0.1
      }}>
            <Card>
              <CardContent className="p-4 sm:p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>

      {/* Analytics Export Center */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <AnalyticsExporter />
      </motion.div>

      {/* Email Analytics Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card border-white/20">
          <CardHeader className="bg-white/5">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Mail className="w-5 h-5" />
              <span>Email Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 font-medium text-white">Email</th>
                    <th className="text-left p-4 font-medium text-white">Campaign</th>
                    <th className="text-left p-4 font-medium text-white">Sent</th>
                    <th className="text-left p-4 font-medium text-white">Opened</th>
                    <th className="text-left p-4 font-medium text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailAnalytics.map((email, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{email.email_address}</td>
                      <td className="p-4 text-white">{email.campaign_id || 'Direct'}</td>
                      <td className="p-4 text-white">{email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4 text-white">{email.opened_at ? new Date(email.opened_at).toLocaleDateString() : 'Not opened'}</td>
                      <td className="p-4">
                        <Badge variant={email.opened_at ? 'default' : 'secondary'} className={email.opened_at ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'glass-secondary'}>
                          {email.opened_at ? 'Opened' : 'Sent'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {emailAnalytics.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        No email analytics data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>;
};
export default AnalyticsSection;