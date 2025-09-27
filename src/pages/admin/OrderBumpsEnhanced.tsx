import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { startLoadingGuard } from '@/utils/asyncGuards';
import { OrderBump } from '@/types/order-bump-types';

const OrderBumpsEnhanced = () => {
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [selectedOrderBump, setSelectedOrderBump] = useState<OrderBump | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderBumpDialog, setShowOrderBumpDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_price: 0,
    discounted_price: 0,
    is_active: true,
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderBumps();
  }, []);

  const fetchOrderBumps = async () => {
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const { data, error } = await supabase
        .from('order_bumps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match expected format
      const transformedData = (data || []).map((bump: any) => ({
        ...bump,
        price: bump.discounted_price || bump.original_price,
        priceDisplay: bump.discounted_price && bump.original_price 
          ? `₦${bump.discounted_price.toLocaleString()}`
          : `₦${(bump.discounted_price || bump.original_price).toLocaleString()}`,
        originalPriceDisplay: bump.original_price ? `₦${bump.original_price.toLocaleString()}` : null,
        hasDiscount: bump.discounted_price && bump.original_price && bump.discounted_price < bump.original_price,
        image: bump.image_url || undefined
      }));
      setOrderBumps(transformedData);
      console.log('[OrderBumps] fetched rows:', Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('[OrderBumps] fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order bumps",
        variant: "destructive",
      });
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const handleSaveOrderBump = async () => {
    try {
      const orderBumpData = {
        title: formData.title,
        description: formData.description,
        original_price: formData.original_price,
        discounted_price: formData.discounted_price,
        is_active: formData.is_active,
        image_url: formData.image_url
      };

      if (selectedOrderBump) {
        const { error } = await supabase
          .from('order_bumps')
          .update(orderBumpData)
          .eq('id', selectedOrderBump.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('order_bumps')
          .insert([orderBumpData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Order Bump ${selectedOrderBump ? 'updated' : 'created'} successfully`,
      });

      setShowOrderBumpDialog(false);
      setSelectedOrderBump(null);
      resetForm();
      fetchOrderBumps();
    } catch (error) {
      console.error('[OrderBumps] save error:', error);
      toast({
        title: "Error",
        description: "Failed to save order bump",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrderBump = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order bump?')) return;
    
    try {
      const { error } = await supabase
        .from('order_bumps')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Order bump deleted successfully",
      });
      
      fetchOrderBumps();
    } catch (error) {
      console.error('[OrderBumps] delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete order bump",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      original_price: 0,
      discounted_price: 0,
      is_active: true,
      image_url: ''
    });
  };

  const openEditDialog = (orderBump: OrderBump) => {
    setSelectedOrderBump(orderBump);
    setFormData({
      title: orderBump.title || '',
      description: orderBump.description || '',
      original_price: orderBump.original_price || 0,
      discounted_price: orderBump.discounted_price || 0,
      is_active: orderBump.is_active ?? true,
      image_url: orderBump.image_url || ''
    });
    setShowOrderBumpDialog(true);
  };

  const openCreateDialog = () => {
    setSelectedOrderBump(null);
    resetForm();
    setShowOrderBumpDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Order Bumps</h2>
        <Button onClick={openCreateDialog} className="glass-button">
          <Plus className="h-4 w-4 mr-2" />
          Create Order Bump
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderBumps.map((orderBump) => (
          <Card key={orderBump.id} className="overflow-hidden order-bump-card">
            <div className="aspect-video bg-gradient-to-br from-yellow-300 to-yellow-400 relative">
              {orderBump.image ? (
                <img
                  src={orderBump.image}
                  alt={orderBump.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-yellow-800">
                  <Package className="w-12 h-12" />
                </div>
              )}
            </div>
            <CardContent className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate text-yellow-900">{orderBump.title}</h3>
                <Badge variant={orderBump.is_active ? "default" : "secondary"} className="bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg">
                  {orderBump.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-yellow-900 text-sm mb-3 line-clamp-2 font-medium">{orderBump.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-bold text-white bg-yellow-600 px-3 py-1 rounded-lg shadow-lg border-2 border-yellow-700">
                    ₦{(orderBump.discounted_price || orderBump.original_price).toLocaleString()}
                  </span>
                  {orderBump.discounted_price && (
                    <span className="text-lg text-yellow-800 line-through mt-1 font-medium">
                      ₦{orderBump.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(orderBump)}
                    className="border-2 border-yellow-700 text-yellow-900 bg-yellow-200 hover:bg-yellow-300 hover:text-yellow-900 shadow-lg font-medium"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOrderBump(orderBump.id)}
                    className="border-2 border-red-600 text-red-700 bg-red-100 hover:bg-red-200 hover:text-red-800 shadow-lg font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Order Bump Dialog */}
      <Dialog open={showOrderBumpDialog} onOpenChange={setShowOrderBumpDialog}>
        <DialogContent className="glass-card glass-modal max-w-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedOrderBump ? 'Edit Order Bump' : 'Create New Order Bump'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedOrderBump ? 'Update order bump details' : 'Create a new order bump offer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
                className="glass-input text-white border-white/20"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                className="glass-input text-white border-white/20"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_price" className="text-white">Original Price (₦)</Label>
                <Input
                  id="original_price"
                  type="number"
                  name="original_price"
                  step="100"
                  inputMode="numeric"
                  value={formData.original_price.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter original price in Naira"
                  className="glass-input text-white border-white/20"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="discounted_price" className="text-white">Discounted Price (₦)</Label>
                <Input
                  id="discounted_price"
                  type="number"
                  name="discounted_price"
                  step="100"
                  inputMode="numeric"
                  value={formData.discounted_price.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, discounted_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter discounted price in Naira"
                  className="glass-input text-white border-white/20"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image_url" className="text-white">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="Enter image URL"
                className="glass-input text-white border-white/20"
                autoComplete="url"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active" className="text-white">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOrderBumpDialog(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button onClick={handleSaveOrderBump} className="glass-button">
                {selectedOrderBump ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderBumpsEnhanced;
