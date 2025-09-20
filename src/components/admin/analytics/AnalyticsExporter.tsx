import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, ShoppingBag, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export const AnalyticsExporter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const exportAllAnalytics = async () => {
    setLoading(true);
    try {
      // Export orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Export customer analytics
      const { data: customerAnalytics, error: customerError } = await supabase
        .from('customer_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerError) throw customerError;

      // Export product analytics
      const { data: productAnalytics, error: productError } = await supabase
        .from('product_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (productError) throw productError;

      // Export email analytics
      const { data: emailAnalytics, error: emailError } = await supabase
        .from('email_analytics')
        .select('*')
        .order('sent_at', { ascending: false });

      if (emailError) throw emailError;

      // Create comprehensive CSV
      const csvSections = [];

      // Orders section
      if (orders && orders.length > 0) {
        csvSections.push('ORDERS DATA');
        csvSections.push('Order ID,Customer Name,Customer Email,Total Amount,Status,Created At');
        csvSections.push(...orders.map(order => 
          `${order.id},${order.customer_name},${order.customer_email},${order.total_amount},${order.status},${order.created_at}`
        ));
        csvSections.push('');
      }

      // Customer Analytics section
      if (customerAnalytics && customerAnalytics.length > 0) {
        csvSections.push('CUSTOMER ANALYTICS');
        csvSections.push('Email,Total Orders,Total Spent,Lifetime Value,Average Order Value,Last Order Date');
        csvSections.push(...customerAnalytics.map(ca => 
          `${ca.customer_email},${ca.total_orders},${ca.total_spent},${ca.lifetime_value},${ca.avg_order_value},${ca.last_order_date}`
        ));
        csvSections.push('');
      }

      // Product Analytics section
      if (productAnalytics && productAnalytics.length > 0) {
        csvSections.push('PRODUCT ANALYTICS');
        csvSections.push('Product ID,Views,Cart Additions,Purchases,Revenue,Date');
        csvSections.push(...productAnalytics.map(pa => 
          `${pa.product_id},${pa.views},${pa.cart_additions},${pa.purchases},${pa.revenue},${pa.date_recorded}`
        ));
        csvSections.push('');
      }

      // Email Analytics section
      if (emailAnalytics && emailAnalytics.length > 0) {
        csvSections.push('EMAIL ANALYTICS');
        csvSections.push('Email Address,Campaign ID,Sent At,Opened At,Clicked At,Bounced At');
        csvSections.push(...emailAnalytics.map(ea => 
          `${ea.email_address},${ea.campaign_id || 'N/A'},${ea.sent_at || 'N/A'},${ea.opened_at || 'N/A'},${ea.clicked_at || 'N/A'},${ea.bounced_at || 'N/A'}`
        ));
      }

      const csvContent = csvSections.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `complete_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Complete analytics data exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSpecificData = async (type: string) => {
    setLoading(true);
    try {
      let data: any[] = [];
      let headers: string[] = [];
      let filename = '';

      switch (type) {
        case 'orders':
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (ordersError) throw ordersError;
          data = ordersData || [];
          headers = ['Order ID', 'Customer Name', 'Customer Email', 'Total Amount', 'Status', 'Created At'];
          filename = 'orders_analytics';
          break;

        case 'customers':
          const { data: customersData, error: customersError } = await supabase
            .from('customer_analytics')
            .select('*')
            .order('created_at', { ascending: false });
          if (customersError) throw customersError;
          data = customersData || [];
          headers = ['Email', 'Total Orders', 'Total Spent', 'Lifetime Value', 'Average Order Value'];
          filename = 'customer_analytics';
          break;

        case 'products':
          const { data: productsData, error: productsError } = await supabase
            .from('product_analytics')
            .select('*')
            .order('created_at', { ascending: false });
          if (productsError) throw productsError;
          data = productsData || [];
          headers = ['Product ID', 'Views', 'Cart Additions', 'Purchases', 'Revenue', 'Date'];
          filename = 'product_analytics';
          break;

        case 'emails':
          const { data: emailsData, error: emailsError } = await supabase
            .from('email_analytics')
            .select('*')
            .order('sent_at', { ascending: false });
          if (emailsError) throw emailsError;
          data = emailsData || [];
          headers = ['Email Address', 'Campaign ID', 'Sent At', 'Opened At', 'Clicked At'];
          filename = 'email_analytics';
          break;
      }

      if (data.length === 0) {
        toast({
          title: "Info",
          description: "No data available for export",
        });
        return;
      }

      const csvContent = [
        headers.join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `${type} analytics exported successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-glass-text flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Analytics Export Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => exportSpecificData('orders')}
              disabled={loading}
              className="w-full glass-button-outline h-20 flex-col"
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span>Orders Data</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => exportSpecificData('customers')}
              disabled={loading}
              className="w-full glass-button-outline h-20 flex-col"
            >
              <Users className="w-6 h-6 mb-2" />
              <span>Customer Analytics</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => exportSpecificData('products')}
              disabled={loading}
              className="w-full glass-button-outline h-20 flex-col"
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <span>Product Analytics</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => exportSpecificData('emails')}
              disabled={loading}
              className="w-full glass-button-outline h-20 flex-col"
            >
              <Mail className="w-6 h-6 mb-2" />
              <span>Email Analytics</span>
            </Button>
          </motion.div>
        </div>

        {/* Complete Export */}
        <div className="border-t border-glass-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-glass-text">Complete Analytics Export</h4>
              <p className="text-sm text-glass-text-secondary">Export all analytics data in one comprehensive file</p>
            </div>
            <Button
              onClick={exportAllAnalytics}
              disabled={loading}
              className="glass-button"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Exporting...' : 'Export All'}
            </Button>
          </div>
        </div>

        {/* Export Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-glass-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-glass-text">1,234</div>
            <div className="text-sm text-glass-text-secondary">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-glass-text">856</div>
            <div className="text-sm text-glass-text-secondary">Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-glass-text">45</div>
            <div className="text-sm text-glass-text-secondary">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-glass-text">2,341</div>
            <div className="text-sm text-glass-text-secondary">Emails Sent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};