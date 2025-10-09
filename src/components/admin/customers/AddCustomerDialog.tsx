import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: () => void;
}

export const AddCustomerDialog = ({ open, onOpenChange, onCustomerAdded }: AddCustomerDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    product_id: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a mock order to add the customer to the system
      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          delivery_address: formData.address,
          total_amount: 0,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer added successfully",
      });

      setFormData({ name: '', email: '', phone: '', address: '', product_id: '' });
      onOpenChange(false);
      onCustomerAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card glass-modal max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Customer Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter customer name"
              required
              className="glass-input text-white border-white/20"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter customer email"
              required
              className="glass-input text-white border-white/20"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-white">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter customer phone"
              className="glass-input text-white border-white/20"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-white">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter customer address"
              className="glass-input text-white border-white/20"
            />
          </div>
          <div>
            <Label htmlFor="product" className="text-white">Product Purchased</Label>
            <Select value={formData.product_id} onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}>
              <SelectTrigger className="glass-input text-white border-white/20">
                <SelectValue placeholder="Select a product" />
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
              {loading ? 'Adding...' : 'Add Customer'}
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="glass-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};