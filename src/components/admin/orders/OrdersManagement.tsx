import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  created_at: string;
  items: any[];
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  payment_reference: string | null;
  notes: string | null;
}

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data || []).map(order => ({
        ...order,
        customer_name: order.customer_name || 'Unknown',
        customer_phone: order.customer_phone || '',
        delivery_address: order.delivery_address || '',
        delivery_city: order.delivery_city || '',
        delivery_state: order.delivery_state || '',
        payment_reference: (order as any).payment_reference || '',
        notes: (order as any).notes || '',
        items: Array.isArray((order as any).items) ? (order as any).items : []
      }) as Order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Email', 'Phone', 'Total', 'Status', 'Date'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer_name,
        order.customer_email,
        order.customer_phone || '',
        order.total_amount,
        order.status,
        format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <CardTitle className="text-glass-text">Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-text-secondary h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input text-glass-text"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] glass-input text-glass-text">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportOrders} className="glass-button">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="rounded-lg border border-glass-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead className="text-glass-text">Order ID</TableHead>
                  <TableHead className="text-glass-text">Customer</TableHead>
                  <TableHead className="text-glass-text">Total</TableHead>
                  <TableHead className="text-glass-text">Status</TableHead>
                  <TableHead className="text-glass-text">Date</TableHead>
                  <TableHead className="text-glass-text">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-glass-border">
                    <TableCell className="text-glass-text font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-glass-text font-medium">{order.customer_name}</div>
                        <div className="text-glass-text-secondary text-sm">{order.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      ₦{order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-glass-text">
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="glass-button-outline"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-glass-text">Order Details</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4 text-glass-text">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <p>Name: {selectedOrder.customer_name}</p>
                                    <p>Email: {selectedOrder.customer_email}</p>
                                    <p>Phone: {selectedOrder.customer_phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Order Information</h4>
                                    <p>Status: {selectedOrder.status}</p>
                                    <p>Payment: {selectedOrder.payment_status}</p>
                                    <p>Total: ₦{selectedOrder.total_amount.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Delivery Address</h4>
                                  <p>{selectedOrder.delivery_address || 'N/A'}</p>
                                  <p>{selectedOrder.delivery_city || 'N/A'}, {selectedOrder.delivery_state || 'N/A'}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Items</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between p-2 bg-glass-accent rounded">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
                                  >
                                    <SelectTrigger className="glass-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
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