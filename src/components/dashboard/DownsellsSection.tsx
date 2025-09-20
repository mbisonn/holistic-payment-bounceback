import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { generatePaymentLink } from '@/utils/paymentLinks';
import { useToast } from '@/hooks/use-toast';

interface DownsellProduct {
  id: string;
  name: string;
  details: string;
  price: number;
  paystack_link?: string;
  created_at?: string;
}

const DownsellsSection = () => {
  const { toast } = useToast();
  const [downsells, setDownsells] = useState<DownsellProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', details: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fire-and-forget; don't block render
    fetchDownsells();
  }, []);

  const fetchDownsells = async () => {
    try {
      const { data, error } = await supabase
        .from('upsell_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDownsells((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        details: item.description || '',
        price: Number(item.price),
        paystack_link: '',
        paystack_link_old: '',
        is_active: item.is_active
      })));
      setError(null);
    } catch (e: any) {
      setDownsells([]);
      setError(e?.message || 'Failed to fetch downsells');
      console.warn('Downsells fetch error:', e);
    }
  };

  const openForm = (product?: DownsellProduct) => {
    if (product) {
      setEditId(product.id);
      setForm({ name: product.name, details: product.details, price: product.price.toString() });
    } else {
      setEditId(null);
      setForm({ name: '', details: '', price: '' });
    }
    setFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        const { error } = await supabase.from('upsell_products').update({ name: form.name, description: form.details, price }).eq('id', editId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Downsell updated.' });
      } else {
        // Create
        const { error } = await supabase.from('upsell_products').insert([{ name: form.name, description: form.details, price, type: 'downsell' }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Downsell created.' });
      }
      setFormOpen(false);
      fetchDownsells();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this downsell?')) return;
    const { error } = await supabase.from('upsell_products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Downsell deleted.' });
      fetchDownsells();
    }
  };

  // Paystack integration: generate payment link
  const handleGenerateLink = async (product: DownsellProduct) => {
    setLinkLoading(product.id);
    try {
      const { paymentUrl } = await generatePaymentLink({
        type: 'downsell',
        productId: product.id,
        productName: product.name,
        price: product.price,
      });

      fetchDownsells();
      toast({ title: 'Link generated', description: 'Paystack link copied to clipboard.' });
      await navigator.clipboard.writeText(paymentUrl);

      // AUTOMATION: Simulate downsell purchase event (non-blocking)
      try {
        await fetch('/functions/v1/automation-handler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'downsell_purchase',
            customer: { email: 'unknown@customer.com', name: 'Unknown Customer' },
            order: { productId: String(product.id), productName: String(product.name), price: product.price }
          })
        });
      } catch (e) { console.warn('Automation handler error:', e); }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLinkLoading(null);
    }
  };

  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchDownsells(); }}>Retry</Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Downsells</h2>
        <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Downsell
        </Button>
      </div>
      {errorBanner}
      {/* List */}
      {downsells.length === 0 ? (
        <div className="text-center text-gray-500">No downsells found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {downsells.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openForm(product)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">{product.details}</div>
                <div className="font-bold text-lg">₦{product.price.toLocaleString()}</div>
                <div className="flex gap-2 items-center">
                  {product.paystack_link ? (
                    <>
                      <a href={product.paystack_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1"><LinkIcon className="h-4 w-4" />Paystack Link</a>
                      <Button size="sm" variant="outline" onClick={() => {navigator.clipboard.writeText(product.paystack_link || ''); toast({ title: 'Copied', description: 'Link copied to clipboard.' });}}>Copy</Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => handleGenerateLink(product)} disabled={linkLoading === product.id}>
                      {linkLoading === product.id ? <Loader2 className="animate-spin h-4 w-4" /> : <LinkIcon className="h-4 w-4" />} Generate Paystack Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Form Modal */}
      {formOpen && (
        <div className="modal-overlay">
          <div className="glass-card glass-modal modal-content max-w-md w-full p-6 relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white/30 rounded-full w-8 h-8 flex items-center justify-center shadow transition" onClick={() => setFormOpen(false)} aria-label="Close modal">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-gradient">{editId ? 'Edit Downsell' : 'Add Downsell'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Name</label>
                <Input name="name" value={form.name} onChange={handleFormChange} required className="glass-input text-white border-white/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Details</label>
                <Textarea name="details" value={form.details} onChange={handleFormChange} rows={3} className="glass-input text-white border-white/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Price (₦)</label>
                <Input name="price" value={form.price} onChange={handleFormChange} required type="number" min={1} className="glass-input text-white border-white/20" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving} className="glass-button-outline">Cancel</Button>
                <Button type="submit" disabled={saving} className="glass-button">{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownsellsSection; 