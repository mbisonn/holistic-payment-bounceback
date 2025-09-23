
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';
import { useAuth } from '@/hooks/useAuth';

type Order = Database['public']['Tables']['orders']['Row'] & {
  shipping_fee?: number;
  discount_amount?: number;
  notes?: string;
};
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    customer_phone: '',
    total_amount: 0,
    shipping_fee: 0,
    discount_amount: 0,
    status: 'pending' as OrderStatus,
    notes: ''
  });
  const { toast } = useToast();

  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for authenticated session to avoid anon RLS blocks
    if (authLoading) return;
    if (!currentUser) return;
    fetchOrders();
  }, [currentUser, authLoading]);

  const fetchOrders = async () => {
    // Force-resolve loading even if network/RLS hangs
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const res = await withTimeout(
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      // Extra diagnostics to console to pinpoint the issue (RLS vs schema vs network)
      console.error('[Orders] fetchOrders error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    try {
      const orderData = {
        ...formData,
        items: []
      };

      if (selectedOrder) {
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', selectedOrder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orders')
          .insert([orderData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Order ${selectedOrder ? 'updated' : 'created'} successfully`,
      });

      setShowOrderDialog(false);
      setSelectedOrder(null);
      resetForm();
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer_name: order.customer_name || '',
      customer_email: order.customer_email,
      delivery_address: order.delivery_address || '',
      delivery_city: order.delivery_city || '',
      delivery_state: order.delivery_state || '',
      customer_phone: order.customer_phone || '',
      total_amount: order.total_amount,
      shipping_fee: order.shipping_fee || 0,
      discount_amount: order.discount_amount || 0,
      status: order.status as OrderStatus,
      notes: order.notes || ''
    });
    setShowOrderDialog(true);
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      delivery_address: '',
      delivery_city: '',
      delivery_state: '',
      customer_phone: '',
      total_amount: 0,
      shipping_fee: 0,
      discount_amount: 0,
      status: 'pending' as OrderStatus,
      notes: ''
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage your orders</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const csvContent = [
                ['Customer', 'Email', 'Status', 'Total', 'Date'],
                ...orders.map(order => [
                  order.customer_name,
                  order.customer_email,
                  order.status,
                  order.total_amount.toString(),
                  order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'
                ])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'orders.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="glass-button-outline"
          >
            Export
          </Button>
          <Button onClick={() => {
            setSelectedOrder(null);
            resetForm();
            setShowOrderDialog(true);
          }} className="glass-button">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(order)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{order.customer_email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={order.status === 'delivered' ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span>${order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? 'Edit Order' : 'Create New Order'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder ? 'Update order details' : 'Create a new order'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="Enter customer email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Input
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  placeholder="Enter delivery address"
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="Enter customer phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_city">Delivery City</Label>
                <Input
                  id="delivery_city"
                  value={formData.delivery_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                  placeholder="Enter delivery city"
                />
              </div>
              <div>
                <Label htmlFor="delivery_state">Delivery State</Label>
                <Input
                  id="delivery_state"
                  value={formData.delivery_state}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_state: e.target.value }))}
                  placeholder="Enter delivery state"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) }))}
                  placeholder="Enter total amount"
                />
              </div>
              <div>
                <Label htmlFor="shipping_fee">Shipping Fee</Label>
                <Input
                  id="shipping_fee"
                  type="number"
                  value={formData.shipping_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_fee: parseFloat(e.target.value) }))}
                  placeholder="Enter shipping fee"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="discount_amount">Discount Amount</Label>
              <Input
                id="discount_amount"
                type="number"
                value={formData.discount_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) }))}
                placeholder="Enter discount amount"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OrderStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter order notes"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrder}>
                {selectedOrder ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
