import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at?: string;
}

const CRMDashboard = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customerMap = new Map<string, CustomerProfile>();
      
      ordersData?.forEach(order => {
        const email = order.customer_email;
        if (!email) return;

        if (customerMap.has(email)) {
          const existing = customerMap.get(email)!;
          existing.total_orders += 1;
          existing.total_spent += order.total_amount || 0;
          
          if (!existing.last_order_date || order.created_at > existing.last_order_date) {
            existing.last_order_date = order.created_at;
          }
        } else {
          customerMap.set(email, {
            id: order.id,
            email: order.customer_email,
            name: order.customer_name || 'Unknown',
            phone: order.customer_phone || undefined,
            delivery_address: order.delivery_address || undefined,
            delivery_city: order.delivery_city || undefined,
            delivery_state: order.delivery_state || undefined,
            total_orders: 1,
            total_spent: order.total_amount || 0,
            last_order_date: order.created_at,
            created_at: order.created_at
          });
        }
      });

      const customersArray = Array.from(customerMap.values());
      setCustomers(customersArray);
      setFilteredCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);
  const totalOrders = customers.reduce((sum, customer) => sum + customer.total_orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterCustomers(term, selectedSegment);
  };

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
    filterCustomers(searchTerm, segment);
  };

  const filterCustomers = (search: string, segment: string) => {
    let filtered = customers;

    if (search) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (segment !== 'all') {
      filtered = filtered.filter(customer => {
        switch (segment) {
          case 'high-value':
            return customer.total_spent > 50000;
          case 'frequent':
            return customer.total_orders > 3;
          case 'recent':
            return customer.last_order_date && 
              new Date(customer.last_order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    setFilteredCustomers(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gray-800 text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lemon-400 lemon-text-glow">{totalCustomers.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gray-800 text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lemon-400 lemon-text-glow">₦{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gray-800 text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lemon-400 lemon-text-glow">{totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gray-800 text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lemon-400 lemon-text-glow">₦{Math.round(avgOrderValue).toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800 text-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-200">Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <Select value={selectedSegment} onValueChange={handleSegmentChange}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900 text-white border-gray-700">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border-gray-700">
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="high-value">High Value</SelectItem>
                <SelectItem value="frequent">Frequent Buyers</SelectItem>
                <SelectItem value="recent">Recent Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        <Badge variant="outline">
                          {customer.total_orders} orders
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.delivery_state && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {customer.delivery_state}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="font-medium">
                          Total Spent: ₦{customer.total_spent.toLocaleString()}
                        </span>
                        {customer.last_order_date && (
                          <span>
                            Last Order: {new Date(customer.last_order_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMDashboard;