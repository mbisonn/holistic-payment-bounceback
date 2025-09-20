import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// removed timeout-retry behavior
import { useToast } from '@/hooks/use-toast';
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ProductsManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    // Fire-and-forget fetch; UI should not block
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (error: any) {
      // Non-fatal: show toast, keep UI visible with empty list
      console.warn('Error fetching products:', error);
      setError(error.message || 'Failed to fetch products');
      setProducts([]);
      toast({
        title: 'Products',
        description: error.message || 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      // no op
    }
  };

  const handleSaveAll = async () => {
    if (products.length === 0) return;
    setBulkSaving(true);
    try {
      const payloads = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        category: p.category,
        is_active: p.is_active,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('products').upsert(payloads, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Saved', description: 'All products saved successfully' });
      fetchProducts();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save products', variant: 'destructive' });
    } finally {
      setBulkSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Never block rendering; show inline error banner and keep content
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
    </div>
  ) : null;
  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', image_url: '', category: '', is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price || ''),
      image_url: product.image_url || '',
      category: product.category || '',
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Product deleted successfully' });
      fetchProducts();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const priceNumber = parseFloat(formData.price);
      if (isNaN(priceNumber) || priceNumber <= 0) {
        throw new Error('Price must be a positive number');
      }
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceNumber,
        image_url: formData.image_url.trim() || null,
        category: formData.category.trim() || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Product updated successfully' });
      } else {
        const { error } = await supabase.from('products').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast({ title: 'Created', description: 'Product created successfully' });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save product', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-white">Products Management</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="glass-button-outline w-full sm:w-auto" onClick={handleSaveAll} disabled={bulkSaving}>
            <Save className="h-4 w-4 mr-2" />
            {bulkSaving ? 'Saving...' : 'Save All'}
          </Button>
          <Button className="glass-button w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Inline error (non-blocking) */}
      {errorBanner}

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 glass-input text-white border-white/20" />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product, index) => <motion.div key={product.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Card className="glass-card overflow-hidden border-white/20">
              <div className="w-full h-40 sm:h-48 bg-white/10 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/70">No Image</span>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                  <h3 className="font-semibold text-lg truncate text-white">{product.name}</h3>
                  <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'glass-secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm mb-3 line-clamp-2 text-gray-300">
                  {product.description || 'No description available'}
                </p>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">₦{product.price.toLocaleString()}</span>
                    {product.discount_price && <span className="text-sm text-gray-400 line-through">₦{product.discount_price.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" className="flex-1 glass-button-outline" onClick={() => openEditDialog(product)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} className="glass-button-outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>

      {filteredProducts.length === 0 && <div className="text-center py-8">
          <p className="text-gray-400">No products found</p>
        </div>}

      {/* Create/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card glass-modal modal-content animate-fade-in w-[100vw] h-[100vh] max-w-none max-h-none p-4 sm:max-w-lg sm:h-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto sm:max-h-none">
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="glass-input text-white border-white/20" />
            </div>
            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="glass-input text-white border-white/20" />
            </div>
            <div>
              <Label htmlFor="price" className="text-white">Price (₦)</Label>
              <Input id="price" type="number" min={1} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="glass-input text-white border-white/20" />
            </div>
            <div>
              <Label htmlFor="image_url" className="text-white">Image URL</Label>
              <Input id="image_url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." className="glass-input text-white border-white/20" />
            </div>
            <div>
              <Label htmlFor="category" className="text-white">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="glass-input text-white border-white/20"
                required
              >
                <option value="">Select a category</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="glass-button">
                {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>;
};
export default ProductsManagement;