import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrencyNGN } from '@/utils/currencyUtils';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';

interface Customer {
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  avg_order_value: number;
  orders?: any[];
  tags?: string[];
  products?: string[];
}

interface Product {
  id: string;
  name: string;
}


export const EnhancedCustomersManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortField, setSortField] = useState<'date' | 'product' | 'tags'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    product_id: '',
    tag_ids: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, sortField, sortOrder]);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true);
      setProducts(productsData || []);

      // Tags will be loaded separately when needed

      // Fetch customers from orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))');

      if (ordersError) throw ordersError;

      // Group by customer email
      const customerMap = new Map();
      
      ordersData?.forEach(order => {
        const email = order.customer_email;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            customer_email: email,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            total_orders: 0,
            total_spent: 0,
            last_order_date: order.created_at,
            orders: [],
            products: new Set(),
            tags: []
          });
        }
        
        const customer = customerMap.get(email);
        customer.total_orders += 1;
        customer.total_spent += order.total_amount;
        customer.orders.push(order);
        
        // Add products
        order.order_items?.forEach((item: any) => {
          if (item.products?.name) {
            customer.products.add(item.products.name);
          }
        });
        
        if (order.created_at && new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
      });

      const customersArray = Array.from(customerMap.values()).map(customer => ({
        ...customer,
        products: Array.from(customer.products),
        avg_order_value: customer.total_spent / customer.total_orders
      }));

      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime();
          break;
        case 'product':
          comparison = (a.products?.length || 0) - (b.products?.length || 0);
          break;
        case 'tags':
          comparison = (a.tags?.length || 0) - (b.tags?.length || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCustomers(filtered);
  };

  const addCustomer = async () => {
    try {
      if (!newCustomer.email || !newCustomer.name) {
        toast.error('Name and email are required');
        return;
      }

      // Create initial order with selected product
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_email: newCustomer.email,
          customer_name: newCustomer.name,
          customer_phone: newCustomer.phone,
          total_amount: 0,
          status: 'pending',
          payment_status: 'pending'
        });

      if (error) throw error;

      setNewCustomer({ name: '', email: '', phone: '', product_id: '', tag_ids: [] });
      setShowAddDialog(false);
      fetchData();
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const handleSort = (field: 'date' | 'product' | 'tags') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-glass-text">Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-text-secondary h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input text-glass-text"
              />
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="glass-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle className="text-glass-text">Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-glass-text">Name *</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      className="glass-input text-glass-text"
                    />
                  </div>
                  <div>
                    <Label className="text-glass-text">Email *</Label>
                    <Input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="glass-input text-glass-text"
                    />
                  </div>
                  <div>
                    <Label className="text-glass-text">Phone</Label>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className="glass-input text-glass-text"
                    />
                  </div>
                  <div>
                    <Label className="text-glass-text">Product Purchased</Label>
                    <Select
                      value={newCustomer.product_id}
                      onValueChange={(value) => setNewCustomer(prev => ({ ...prev, product_id: value }))}
                    >
                      <SelectTrigger className="glass-input text-glass-text">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addCustomer} className="w-full glass-button">
                    Add Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border border-glass-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead className="text-glass-text">Customer</TableHead>
                  <TableHead className="text-glass-text">Products</TableHead>
                  <TableHead className="text-glass-text">Total Orders</TableHead>
                  <TableHead className="text-glass-text">Total Spent</TableHead>
                  <TableHead className="text-glass-text">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('date')}
                      className="text-glass-text hover:text-white"
                    >
                      Last Order
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-glass-text">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('tags')}
                      className="text-glass-text hover:text-white"
                    >
                      Tags
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-glass-text">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.customer_email} className="border-glass-border">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-glass-text font-medium">{customer.customer_name}</div>
                        <div className="text-glass-text-secondary text-sm">{customer.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      <div className="flex flex-wrap gap-1">
                        {customer.products?.slice(0, 2).map((product, idx) => (
                          <Badge key={idx} variant="outline" className="border-glass-border text-glass-text text-xs">
                            {product}
                          </Badge>
                        ))}
                        {customer.products && customer.products.length > 2 && (
                          <Badge variant="outline" className="border-glass-border text-glass-text text-xs">
                            +{customer.products.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      <Badge variant="outline" className="border-glass-border text-glass-text">
                        {customer.total_orders}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {formatCurrencyNGN(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {format(new Date(customer.last_order_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags?.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {customer.tags && customer.tags.length > 2 && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            +{customer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewCustomerDetails(customer)}
                          className="glass-button-outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="glass-button-outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};
