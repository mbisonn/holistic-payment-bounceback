import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { hardcodedProducts } from '@/data/hardcodedProducts';
import { toast as sonnerToast } from 'sonner';
import { startLoadingGuard } from '@/utils/asyncGuards';
import { useAuth } from '@/hooks/useAuth';

type Product = Database['public']['Tables']['products']['Row'];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for authenticated session to avoid anon RLS blocks
    if (authLoading) return;
    // RLS is temporarily disabled, so allow fetching without requiring an authenticated user
    fetchProducts();
    syncHardcodedProducts();
  }, [currentUser, authLoading]);

  // Sync hardcoded products to Supabase on component mount
  const syncHardcodedProducts = async () => {
    try {
      const productArray = Object.values(hardcodedProducts).map(product => ({
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.image,
        category: product.category,
        is_active: true
      }));

      // Check if products already exist
      const { data: existingProducts } = await supabase
        .from('products')
        .select('name');

      const existingNames = existingProducts?.map((p: { name: string }) => p.name) || [];
      const newProducts = productArray.filter((p: { name: string }) => !existingNames.includes(p.name));

      if (newProducts.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(newProducts);

        if (error) {
          console.error('Error syncing products:', error);
        } else {
          sonnerToast.success(`Synced ${newProducts.length} new products`);
        }
      }
    } catch (error) {
      console.error('Error in product sync:', error);
    }
  };

  const fetchProducts = async () => {
    console.log('[Products] Starting to fetch products...');
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      console.log('[Products] Making Supabase request...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('[Products] Supabase response:', { data, error });
      
      if (error) {
        console.error('[Products] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      // Ensure data is an array before setting state
      const productsData = Array.isArray(data) ? data : [];
      console.log(`[Products] Fetched ${productsData.length} products`);
      setProducts(productsData);
      
      // If no products, check if we should sync hardcoded ones
      if (productsData.length === 0) {
        console.log('[Products] No products found, checking if we should sync hardcoded products');
        syncHardcodedProducts();
      }
      
    } catch (error) {
      console.error('[Products] Error in fetchProducts:', error);
      toast({
        title: "Error",
        description: `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      try { stopGuard(); } catch (e) { console.error('Error in stopGuard:', e); }
      setLoading(false);
      console.log('[Products] Finished fetchProducts');
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', selectedProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Product ${selectedProduct ? 'updated' : 'created'} successfully`,
      });

      setShowProductDialog(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: '',
      description: '',
      is_active: true
    });
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || '',
      description: product.description || '',
      is_active: product.is_active ?? true
    });
    setShowProductDialog(true);
  };

  const exportProducts = () => {
    const csvContent = [
      ['Name', 'Price', 'Category', 'Description', 'Active'],
      ...products.map(product => [
        product.name,
        product.price.toString(),
        product.category || '',
        product.description || '',
        (product.is_active ?? true).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportProducts}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => {
              setSelectedProduct(null);
              resetForm();
              setShowProductDialog(true);
            }}
            className="glass-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span>${product.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span>{product.category || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={(product.is_active ?? true) ? "default" : "secondary"}>
                    {(product.is_active ?? true) ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Update product details' : 'Create a new product'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter product price"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter product category"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                {selectedProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
