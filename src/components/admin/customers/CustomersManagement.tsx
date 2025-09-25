import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Plus, FileText, Table as TableIcon, Image } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrencyNGN } from '@/utils/currencyUtils';

interface Customer {
  customer_email: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  avg_order_value: number;
  lifetime_value: number;
}

export const CustomersManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      // Aggregate customer data from orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, customer_name, total_amount, created_at');

      if (ordersError) throw ordersError;

      // Group by customer email and calculate metrics
      const customerMap = new Map();
      
      ordersData?.forEach(order => {
        const email = order.customer_email;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            customer_email: email,
            customer_name: order.customer_name,
            total_orders: 0,
            total_spent: 0,
            last_order_date: order.created_at,
            orders: []
          });
        }
        
        const customer = customerMap.get(email);
        customer.total_orders += 1;
        customer.total_spent += order.total_amount;
        customer.orders.push(order);
        
        if (order.created_at && new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
      });

      // Calculate additional metrics
      const customersArray = Array.from(customerMap.values()).map(customer => ({
        ...customer,
        avg_order_value: customer.total_spent / customer.total_orders,
        lifetime_value: customer.total_spent
      }));

      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const addCustomer = async () => {
    try {
      // Add to orders table with a placeholder order
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_email: newCustomer.email,
          customer_name: newCustomer.name,
          customer_phone: newCustomer.phone,
          total_amount: 0,
          status: 'pending',
          payment_status: 'pending',
          items: []
        });

      if (error) throw error;

      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddDialog(false);
      fetchCustomers();
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const exportCustomers = (format: 'csv' | 'excel' | 'pdf') => {
    const data = filteredCustomers.map(customer => [
      customer.customer_name,
      customer.customer_email,
      customer.total_orders,
      customer.total_spent,
      customer.avg_order_value,
      customer.lifetime_value,
      new Date(customer.last_order_date).toISOString().split('T')[0]
    ]);

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = [
          ['Name', 'Email', 'Total Orders', 'Total Spent', 'Avg Order Value', 'Lifetime Value', 'Last Order'],
          ...data
        ].map(row => row.join(',')).join('\n');
        filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      
      case 'excel':
        // For simplicity, we'll export as CSV with .xlsx extension
        content = [
          ['Name', 'Email', 'Total Orders', 'Total Spent', 'Avg Order Value', 'Lifetime Value', 'Last Order'],
          ...data
        ].map(row => row.join('\t')).join('\n');
        filename = `customers-${new Date().toISOString().split('T')[0]}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      
      case 'pdf':
        // For PDF, we'll create a simple text format
        content = `Customers Report - ${new Date().toISOString().split('T')[0]}\n\n` +
          filteredCustomers.map(customer => 
            `Name: ${customer.customer_name}\n` +
            `Email: ${customer.customer_email}\n` +
            `Total Orders: ${customer.total_orders}\n` +
            `Total Spent: ${formatCurrencyNGN(customer.total_spent)}\n` +
            `Avg Order Value: ${formatCurrencyNGN(customer.avg_order_value)}\n` +
            `Lifetime Value: ${formatCurrencyNGN(customer.lifetime_value)}\n` +
            `Last Order: ${new Date(customer.last_order_date).toISOString().split('T')[0]}\n\n`
          ).join('');
        filename = `customers-${new Date().toISOString().split('T')[0]}.pdf`;
        mimeType = 'application/pdf';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Customers exported as ${format.toUpperCase()}`);
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
                    <Label className="text-glass-text">Name</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      className="glass-input text-glass-text"
                    />
                  </div>
                  <div>
                    <Label className="text-glass-text">Email</Label>
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
                  <Button onClick={addCustomer} className="w-full glass-button">
                    Add Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Button onClick={() => exportCustomers('csv')} variant="outline" className="glass-button-outline">
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportCustomers('excel')} variant="outline" className="glass-button-outline">
                <TableIcon className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportCustomers('pdf')} variant="outline" className="glass-button-outline">
                <Image className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-glass-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead className="text-glass-text">Customer</TableHead>
                  <TableHead className="text-glass-text">Total Orders</TableHead>
                  <TableHead className="text-glass-text">Total Spent</TableHead>
                  <TableHead className="text-glass-text">Avg Order Value</TableHead>
                  <TableHead className="text-glass-text">Last Order</TableHead>
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
                      <Badge variant="outline" className="border-glass-border text-glass-text">
                        {customer.total_orders}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {formatCurrencyNGN(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {formatCurrencyNGN(customer.avg_order_value)}
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {format(new Date(customer.last_order_date), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};