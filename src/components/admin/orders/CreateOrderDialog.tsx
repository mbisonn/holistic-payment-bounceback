import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export const CreateOrderDialog = ({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    shipping_fee: '0',
    discount_amount: '0',
    notes: '',
    status: 'pending' as const
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addOrderItem = () => {
    if (products.length > 0) {
      setOrderItems([...orderItems, {
        product_id: products[0].id,
        quantity: 1,
        price: products[0].price
      }]);
    }
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update price if product changed
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].price = product.price;
      }
    }
    
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = parseFloat(formData.shipping_fee) || 0;
    const discount = parseFloat(formData.discount_amount) || 0;
    return itemsTotal + shipping - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          delivery_address: formData.delivery_address,
          delivery_city: formData.delivery_city,
          delivery_state: formData.delivery_state,
          total_amount: calculateTotal(),
          status: formData.status,
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: 'Order created successfully'
      });

      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        shipping_fee: '0',
        discount_amount: '0',
        notes: '',
        status: 'pending'
      });
      setOrderItems([]);
      onOpenChange(false);
      onOrderCreated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name" className="text-white">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  required
                  className="glass-input text-white"
                />
              </div>
              <div>
                <Label htmlFor="customer_email" className="text-white">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  required
                  className="glass-input text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customer_phone" className="text-white">Customer Phone</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="glass-input text-white"
              />
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Delivery Information</h3>
            <div>
              <Label htmlFor="delivery_address" className="text-white">Delivery Address</Label>
              <Input
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                className="glass-input text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_city" className="text-white">Delivery City</Label>
                <Input
                  id="delivery_city"
                  value={formData.delivery_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                  className="glass-input text-white"
                />
              </div>
              <div>
                <Label htmlFor="delivery_state" className="text-white">Delivery State</Label>
                <Input
                  id="delivery_state"
                  value={formData.delivery_state}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_state: e.target.value }))}
                  className="glass-input text-white"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Order Items</h3>
              <Button type="button" onClick={addOrderItem} size="sm" className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <Label className="text-white">Product</Label>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                  >
                    <SelectTrigger className="glass-input text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₦{product.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-white">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                    className="glass-input text-white"
                  />
                </div>
                <div className="w-32">
                  <Label className="text-white">Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                    className="glass-input text-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeOrderItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shipping_fee" className="text-white">Shipping Fee (₦)</Label>
                <Input
                  id="shipping_fee"
                  type="number"
                  value={formData.shipping_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_fee: e.target.value }))}
                  className="glass-input text-white"
                />
              </div>
              <div>
                <Label htmlFor="discount_amount" className="text-white">Discount Amount (₦)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                  className="glass-input text-white"
                />
              </div>
              <div>
                <Label className="text-white">Total Amount</Label>
                <div className="glass-input text-white font-bold">
                  ₦{calculateTotal().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="glass-input text-white">
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
            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter order notes"
                className="glass-input text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="glass-button-outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="glass-button"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
