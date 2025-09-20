
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Globe } from 'lucide-react';
import { withTimeout } from '@/utils/asyncGuards';

interface ShippingSetting {
  id: string;
  name: string;
  description: string | null;
  base_fee: number;
  lagos_delivery_fee: number;
  other_states_delivery_fee: number;
  free_shipping_threshold: number;
  enable_free_shipping: boolean;
  is_active: boolean;
  created_at: string;
}

const ShippingSettings = () => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    base_fee: 0,
    lagos_delivery_fee: 0,
    other_states_delivery_fee: 0,
    free_shipping_threshold: 0,
    enable_free_shipping: false,
    is_active: true,
  });

  const { data: shippingSettings = [], isLoading, refetch } = useQuery({
    queryKey: ['shipping_settings'],
    queryFn: async () => {
      const res = await withTimeout(
        supabase
          .from('shipping_settings')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      return data as ShippingSetting[];
    },
  });

  useEffect(() => { refetch(); }, [refetch]);

  const resetForm = () => {
    setSettings({
      name: '',
      description: '',
      base_fee: 0,
      lagos_delivery_fee: 0,
      other_states_delivery_fee: 0,
      free_shipping_threshold: 0,
      enable_free_shipping: false,
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (setting: ShippingSetting) => {
    setEditingId(setting.id);
    setSettings({
      name: setting.name,
      description: setting.description || '',
      base_fee: setting.base_fee,
      lagos_delivery_fee: setting.lagos_delivery_fee,
      other_states_delivery_fee: setting.other_states_delivery_fee,
      free_shipping_threshold: setting.free_shipping_threshold,
      enable_free_shipping: setting.enable_free_shipping,
      is_active: setting.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipping_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast({
        title: "Success!",
        description: "Shipping setting deleted successfully.",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting shipping setting:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.name || !settings.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the shipping setting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('shipping_settings')
        .upsert({
          id: editingId || undefined,
          name: settings.name.trim(),
          description: settings.description?.trim() || null,
          base_fee: Number(settings.base_fee) || 0,
          lagos_delivery_fee: Number(settings.lagos_delivery_fee) || 0,
          other_states_delivery_fee: Number(settings.other_states_delivery_fee) || 0,
          free_shipping_threshold: Number(settings.free_shipping_threshold) || 0,
          enable_free_shipping: settings.enable_free_shipping,
          is_active: settings.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: editingId ? "Shipping setting updated successfully." : "Shipping setting created successfully.",
      });

      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving shipping setting:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Shipping Settings</h1>

      {/* Form */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-semibold">
            {editingId ? 'Edit Shipping Setting' : 'Add New Shipping Setting'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                value={settings.description || ''}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="base_fee">Base Fee</Label>
              <Input
                type="number"
                id="base_fee"
                value={settings.base_fee}
                onChange={(e) => setSettings({ ...settings, base_fee: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="lagos_delivery_fee">Lagos Delivery Fee</Label>
              <Input
                type="number"
                id="lagos_delivery_fee"
                value={settings.lagos_delivery_fee}
                onChange={(e) => setSettings({ ...settings, lagos_delivery_fee: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="other_states_delivery_fee">Other States Delivery Fee</Label>
              <Input
                type="number"
                id="other_states_delivery_fee"
                value={settings.other_states_delivery_fee}
                onChange={(e) => setSettings({ ...settings, other_states_delivery_fee: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
              <Input
                type="number"
                id="free_shipping_threshold"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable_free_shipping"
                checked={settings.enable_free_shipping}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_free_shipping: !!checked })}
              />
              <Label htmlFor="enable_free_shipping">Enable Free Shipping</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={settings.is_active}
                onCheckedChange={(checked) => setSettings({ ...settings, is_active: !!checked })}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700">
              {editingId ? 'Update Setting' : 'Create Setting'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* List of Settings */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {shippingSettings.map((setting) => (
          <Card key={setting.id} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{setting.name}</CardTitle>
              <Globe className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{setting.description}</p>
              <div className="text-sm">Base Fee: ₦{setting.base_fee.toLocaleString()}</div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(setting)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(setting.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShippingSettings;
