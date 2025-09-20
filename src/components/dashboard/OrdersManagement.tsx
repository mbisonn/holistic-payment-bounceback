import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Eye, 
  Filter,
  Download,
  Calendar,
  Truck,
  MapPin,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// Removed unused import; notification_settings is queried directly from DB
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  items: any;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  status: OrderStatus;
  payment_status: string;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    paymentStatus: 'all'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fire-and-forget; do not block UI
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (error: any) {
      // Non-fatal: log, toast, keep UI rendering with empty list
      console.warn('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
      setOrders([]);
      setFilteredOrders([]);
      toast({ title: 'Orders', description: error.message || 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      // do not block UI on loading
    }
  };

  // Listen for new orders (cash or pay-on-delivery) and notify configured emails
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload: any) => {
        try {
          const order = payload?.new || {};
          // Fetch notification recipients
          const { data: notif } = await supabase
            .from('notification_settings')
            .select('email_addresses, is_active')
            .eq('setting_type', 'activity_notifications')
            .single();
          const emails: string[] = notif?.email_addresses || [];
          const enabled = notif?.is_active !== false;
          if (enabled && emails.length > 0) {
            // Queue an email per recipient via email_outbox
            const subject = `New order from ${order.customer_name || order.customer_email}`;
            const body = `A new ${order.payment_status || 'pending'} order was placed. Total: ₦${Number(order.total_amount || 0).toLocaleString()}.\nReference: ${order.payment_reference || 'N/A'}`;
            const rows = emails.map((to) => ({ to_email: to, subject, body }));
            await supabase.from('email_outbox').insert(rows);
            toast({ title: 'New Order', description: 'Notification emails queued' });
          }
        } catch (e) {
          console.warn('Failed to queue order notification emails', e);
        }
        // Refresh orders list
        fetchOrders();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully'
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (filterCriteria.dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= new Date(filterCriteria.dateFrom)
      );
    }
    if (filterCriteria.dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= new Date(filterCriteria.dateTo)
      );
    }

    // Amount range filter
    if (filterCriteria.amountMin) {
      filtered = filtered.filter(order => 
        order.total_amount >= parseFloat(filterCriteria.amountMin)
      );
    }
    if (filterCriteria.amountMax) {
      filtered = filtered.filter(order => 
        order.total_amount <= parseFloat(filterCriteria.amountMax)
      );
    }

    // Payment status filter
    if (filterCriteria.paymentStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.payment_status === filterCriteria.paymentStatus
      );
    }

    setFilteredOrders(filtered);
    setShowFilterDialog(false);
    toast({
      title: 'Filters Applied',
      description: `Showing ${filtered.length} orders`,
    });
  };

  const clearFilters = () => {
    setFilterCriteria({
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      paymentStatus: 'all'
    });
    setStatusFilter('all');
    setSearchTerm('');
    setFilteredOrders(orders);
    setShowFilterDialog(false);
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset',
    });
  };


  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchOrders(); }}>Retry</Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-text w-4 h-4" />
              <input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 w-full py-2 px-4 text-bright placeholder-glass-text"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2 text-white border-white/20 w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <Button 
              onClick={() => setShowFilterDialog(true)} 
              className="glass-button-outline flex-1 lg:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="glass-button-outline flex-1 lg:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Inline error (non-blocking) */}
      {errorBanner}

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="glass-secondary border-b border-white/10">
              <tr>
                <th className="text-left p-4 font-medium text-bright">Order ID</th>
                <th className="text-left p-4 font-medium text-bright">Customer</th>
                <th className="text-left p-4 font-medium text-bright">Total</th>
                <th className="text-left p-4 font-medium text-bright">Status</th>
                <th className="text-left p-4 font-medium text-bright">Payment</th>
                <th className="text-left p-4 font-medium text-bright">Date</th>
                <th className="text-left p-4 font-medium text-bright">Actions</th>
              </tr>
            </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-purple-300">
                        #{order.id.slice(-8)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-bright">{order.customer_name}</p>
                        <p className="text-sm text-glass-text">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-bright">
                        ₦{order.total_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : order.status === 'processing'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : order.status === 'shipped'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.payment_status === 'paid'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : order.payment_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-glass-text">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="glass-button-outline px-3 py-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setTrackingOrder(order)}
                          className="glass-button-outline px-3 py-1"
                        >
                          <Truck className="w-4 h-4" />
                        </Button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="glass-input text-xs px-2 py-1 text-bright"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="glass-card text-center py-12">
          <Package className="w-16 h-16 text-glass-text mx-auto mb-4" />
          <p className="text-glass-text text-lg">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-bright">Order Details</h2>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  className="glass-button-outline"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-bright">Customer Information</h3>
                  <div className="glass-secondary p-4 rounded-lg space-y-2">
                    <p className="text-glass-text"><span className="font-medium text-bright">Name:</span> {selectedOrder.customer_name}</p>
                    <p className="text-glass-text"><span className="font-medium text-bright">Email:</span> {selectedOrder.customer_email}</p>
                    <p className="text-glass-text"><span className="font-medium text-bright">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedOrder.delivery_address && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Delivery Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Address:</span> {selectedOrder.delivery_address}</p>
                      <p><span className="font-medium">City:</span> {selectedOrder.delivery_city || 'N/A'}</p>
                      <p><span className="font-medium">State:</span> {selectedOrder.delivery_state || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Array.isArray(selectedOrder.items) ? (
                      selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex flex-col sm:flex-row justify-between items-center py-2 border-b last:border-b-0 gap-2">
                          <div>
                            <p className="font-medium">{item.name || 'Unknown Item'}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                          </div>
                          <p className="font-medium">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₦{(selectedOrder.total_amount - selectedOrder.shipping_fee + selectedOrder.discount_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₦{selectedOrder.shipping_fee.toLocaleString()}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₦{selectedOrder.discount_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₦{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.payment_status === 'paid'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : selectedOrder.payment_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    {selectedOrder.payment_reference && (
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-mono text-sm">{selectedOrder.payment_reference}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Order Tracking Modal */}
      {trackingOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setTrackingOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-bright">Order Tracking</h2>
                </div>
                <Button
                  onClick={() => setTrackingOrder(null)}
                  className="glass-button-outline"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="glass-secondary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-glass-text">Order ID</span>
                    <span className="font-mono text-purple-300">#{trackingOrder.id.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-glass-text">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trackingOrder.status === 'delivered' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : trackingOrder.status === 'shipped'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : trackingOrder.status === 'processing'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {trackingOrder.status}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-glass-text">Delivery Address</span>
                    <div className="text-right">
                      <div className="flex items-center text-bright">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{trackingOrder.delivery_address || 'Not provided'}</span>
                      </div>
                      {trackingOrder.delivery_city && (
                        <div className="text-sm text-glass-text">
                          {trackingOrder.delivery_city}, {trackingOrder.delivery_state}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-bright">Tracking Timeline</h4>
                  <div className="space-y-2">
                    {[
                      { status: 'pending', label: 'Order Placed', completed: true },
                      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(trackingOrder.status) },
                      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(trackingOrder.status) },
                      { status: 'delivered', label: 'Delivered', completed: trackingOrder.status === 'delivered' }
                    ].map((step) => (
                      <div key={step.status} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          step.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-glass-text bg-transparent'
                        }`}>
                          {step.completed && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                        </div>
                        <span className={step.completed ? 'text-bright' : 'text-glass-text'}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="glass-card glass-modal animate-fade-in w-[100vw] h-[100vh] max-w-none max-h-none p-4 sm:max-w-md sm:h-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Filter Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto sm:max-h-none">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Date From</Label>
                <Input
                  type="date"
                  value={filterCriteria.dateFrom}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div>
                <Label className="text-white">Date To</Label>
                <Input
                  type="date"
                  value={filterCriteria.dateTo}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="glass-input text-white border-white/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Min Amount (₦)</Label>
                <Input
                  type="number"
                  value={filterCriteria.amountMin}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="glass-input text-white border-white/20"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-white">Max Amount (₦)</Label>
                <Input
                  type="number"
                  value={filterCriteria.amountMax}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="glass-input text-white border-white/20"
                  placeholder="1000000"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Payment Status</Label>
              <Select 
                value={filterCriteria.paymentStatus} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger className="glass-input text-white border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                  <SelectItem value="paid" className="text-white hover:bg-white/10">Paid</SelectItem>
                  <SelectItem value="pending" className="text-white hover:bg-white/10">Pending</SelectItem>
                  <SelectItem value="failed" className="text-white hover:bg-white/10">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="glass-button-outline"
              >
                Clear All
              </Button>
              <Button 
                onClick={applyFilters}
                className="glass-button"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
