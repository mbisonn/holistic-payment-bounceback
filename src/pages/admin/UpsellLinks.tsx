import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withTimeout } from '@/utils/asyncGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Link, ExternalLink, Save } from 'lucide-react';

interface UpsellProduct {
  id: string;
  name: string;
  type: string;
  price: number;
  duration_months: number;
  description?: string;
  created_at: string;
}

const UpsellLinks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UpsellProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'upsell',
    price: 0,
    duration_months: 1,
    description: ''
  });

  // Fetch upsell products from the correct table
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['upsell_products'],
    queryFn: async () => {
      const res = await withTimeout(
        supabase
          .from('upsell_products')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      console.log('[UpsellLinks] fetched rows:', Array.isArray(data) ? data.length : 0);
      return (data || []) as UpsellProduct[];
    },
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (newProduct: typeof formData) => {
      const res = await withTimeout(
        supabase
          .from('upsell_products')
          .insert([{
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            type: newProduct.type,
            duration_months: newProduct.duration_months
          }])
          .select()
          .single() as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsell_products'] });
      setFormData({ name: '', type: 'membership', price: 0, duration_months: 1, description: '' });
      setDialogOpen(false);
      toast({
        title: "Success!",
        description: "Product created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('[UpsellLinks] create error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UpsellProduct> }) => {
      const res = await withTimeout(
        supabase
          .from('upsell_products')
          .update({
            name: updates.name,
            description: updates.description,
            price: updates.price,
            type: updates.type,
            duration_months: updates.duration_months
          })
          .eq('id', id)
          .select()
          .single() as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      console.log('[UpsellLinks] updated product:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsell_products'] });
      setEditingProduct(null);
      setDialogOpen(false);
      toast({
        title: "Success!",
        description: "Product updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('[UpsellLinks] update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await withTimeout(
        supabase
          .from('upsell_products')
          .delete()
          .eq('id', id) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { error } = res ?? {};
      if (error) throw error;
      console.log('[UpsellLinks] deleted product:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsell_products'] });
      toast({
        title: "Success!",
        description: "Product deleted successfully.",
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleStartEdit = (product: UpsellProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price,
      duration_months: product.duration_months,
      description: product.description || ''
    });
    setDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    if (!formData.name || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingProduct.id, updates: formData });
  };

  const generatePaystackLink = async (product: UpsellProduct) => {
    try {
      // Call the Supabase Edge Function to generate a real Paystack payment link
      const { data, error } = await supabase.functions.invoke('payment-links', {
        body: {
          type: product.type, // 'upsell' or 'downsell'
          customerInfo: {
            name: 'Customer',
            email: 'customer@example.com'
          },
          productId: product.id,
          productName: product.name,
          price: product.price
        }
      });

      if (error) throw error;

      if (data?.success && data?.data?.payment_url) {
        await navigator.clipboard.writeText(data.data.payment_url);
        toast({
          title: "Payment Link Generated!",
          description: `Paystack payment link copied to clipboard. Amount: ₦${product.price.toLocaleString()}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to generate payment link');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate payment link.',
        variant: "destructive",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed background with proper z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 12 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          >
            <Link className="w-4 h-4 text-green-400/20" />
          </motion.div>
        ))}
      </div>

      {/* Main content with proper z-index */}
      <motion.div 
        className="relative z-10 space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
              <Link className="h-6 w-6" />
              Upsell Products & Links
            </h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Upsell Product'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Update the product details.' : 'Create a new upsell product for your store.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  editingProduct ? handleSaveEdit() : handleCreate();
                }}>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        autoFocus
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label id="type-label" htmlFor="type">Product Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger id="type" aria-labelledby="type-label">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₦)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        name="price"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration_months">Duration (Months)</Label>
                      <Input
                        id="duration_months"
                        type="number"
                        min={1}
                        step="1"
                        inputMode="numeric"
                        name="duration_months"
                        value={formData.duration_months}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_months: parseInt(e.target.value) || 1 }))}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      {editingProduct ? 'Save Changes' : 'Create Product'}
                    </Button>
                    <Button type="button" onClick={editingProduct ? handleSaveEdit : handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save Product
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setDialogOpen(false);
                      setEditingProduct(null);
                      setFormData({ name: '', type: 'upsell', price: 0, duration_months: 1, description: '' });
                    }}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Products List */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <Card className="bg-gradient-to-br from-white via-green-50/30 to-teal-50/30 shadow-2xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 overflow-hidden h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {product.type} • {product.duration_months} month{product.duration_months > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        ₦{product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {product.description && (
                    <div className="text-sm text-gray-600">
                      {product.description}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => generatePaystackLink(product)}
                      className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Generate Paystack Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStartEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteMutation.mutate(product.id)}
                      className="flex-1 text-red-600 hover:bg-red-50"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpsellLinks;
