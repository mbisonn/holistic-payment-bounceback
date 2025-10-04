import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Link as LinkIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { useToast } from '@/hooks/use-toast';
import { PaystackLinkGenerator } from '@/components/admin/upsell/PaystackLinkGenerator';

interface UpsellProduct {
  id: string;
  name: string;
  details: string;
  price: number;
  paystack_link?: string;
  created_at?: string;
}

const UpsellsSection = () => {
  const { toast } = useToast();
  const [upsells, setUpsells] = useState<UpsellProduct[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', details: '', price: '' });
  const [saving, setSaving] = useState(false);
  
  const [paystackDialogOpen, setPaystackDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    // Fire-and-forget; don't block render
    fetchUpsells();
  }, []);

  const fetchUpsells = async () => {
    try {
      const { data, error } = await supabase
        .from('upsell_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUpsells((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        details: item.description || '',
        price: item.price,
        paystack_link: '',
        is_active: item.is_active
      })));
      setError(null);
    } catch (e: any) {
      setUpsells([]);
      setError(e?.message || 'Failed to fetch upsell products');
      console.warn('Upsells fetch error:', e);
    }
  };

  const openForm = (product?: UpsellProduct) => {
    if (product) {
      setEditId(product.id);
      setForm({ name: product.name, details: product.details, price: product.price.toString() });
    } else {
      setEditId(null);
      setForm({ name: '', details: '', price: '' });
    }
    setFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.name || !form.price) throw new Error('Name and price are required');
      const price = parseInt(form.price, 10);
      if (isNaN(price) || price <= 0) throw new Error('Price must be a positive number');
      if (editId) {
        // Update
        const { error } = await supabase.from('upsell_products').update({ 
          name: form.name, 
          description: form.details, 
          price
        }).eq('id', editId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Product updated.' });
      } else {
        // Create
        const { error } = await supabase.from('upsell_products').insert([{ 
          name: form.name, 
          description: form.details, 
          price
        }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Product created.' });
      }
      setFormOpen(false);
      fetchUpsells();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('upsell_products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Product deleted.' });
      fetchUpsells();
    }
  };

  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchUpsells(); }}>Retry</Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Upsell/Downsell Products</h2>
        <Button onClick={() => openForm()} className="glass-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      {errorBanner}

      {upsells.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No upsell/downsell products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {upsells.map((product) => (
            <Card key={product.id} className="glass-card overflow-hidden border-white/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg text-white">{product.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openForm(product)} className="glass-button-outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} className="glass-button-outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-gray-300 text-sm line-clamp-2">{product.details}</div>
                <div className="font-bold text-lg text-white">₦{product.price.toLocaleString()}</div>
                <div className="flex gap-2 items-center">
                  {product.paystack_link ? (
                    <>
                      <a href={product.paystack_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline flex items-center gap-1 hover:text-blue-300">
                        <LinkIcon className="h-4 w-4" />Paystack Link
                      </a>
                      <Button size="sm" variant="outline" onClick={() => {
                        navigator.clipboard.writeText(product.paystack_link || ''); 
                        toast({ title: 'Copied', description: 'Link copied to clipboard.' });
                      }} className="glass-button-outline">Copy</Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setPaystackDialogOpen(true);
                      }}
                      className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Generate Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal - Fixed positioning to prevent movement */}
      {formOpen && (
        <div className="modal-overlay">
          <div className="glass-card glass-modal modal-content max-w-md w-full p-6 relative animate-fade-in">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white/30 rounded-full w-8 h-8 flex items-center justify-center shadow transition-all duration-300 hover:bg-white/50" 
              onClick={() => setFormOpen(false)} 
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gradient">{editId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Name</label>
                <Input 
                  name="name" 
                  value={form.name} 
                  onChange={handleFormChange} 
                  required 
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Details</label>
                <Textarea 
                  name="details" 
                  value={form.details} 
                  onChange={handleFormChange} 
                  rows={3} 
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Price (₦)</label>
                <Input 
                  name="price" 
                  value={form.price} 
                  onChange={handleFormChange} 
                  required 
                  type="number" 
                  min={1} 
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving} className="glass-button-outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="glass-button">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProduct && (
        <PaystackLinkGenerator
          open={paystackDialogOpen}
          onOpenChange={setPaystackDialogOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
        />
      )}
    </div>
  );
};

export default UpsellsSection;