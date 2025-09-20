import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';
import { Database } from '@/integrations/supabase/types';

// Use the database type directly
type Invoice = Database['public']['Tables']['invoices']['Row'];

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    total_amount: 0,
    tax_amount: 0,
    subtotal: 0,
    status: 'draft'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    // Ensure UI never hangs if Supabase/network stalls
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const res = await withTimeout(
        supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      setInvoices(data || []);
      console.log('[Invoices] fetched rows:', Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('[Invoices] fetchInvoices error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const invoiceData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        total_amount: formData.total_amount,
        tax_amount: formData.tax_amount,
        subtotal: formData.subtotal,
        status: formData.status,
        items: []
      };

      if (selectedInvoice) {
        const { error } = await withTimeout(
          supabase
            .from('invoices')
            .update(invoiceData)
            .eq('id', selectedInvoice.id) as unknown as PromiseLike<any>,
          8000
        ) as any;
        if (error) throw error;
      } else {
        const { error } = await withTimeout(
          supabase
            .from('invoices')
            .insert([invoiceData]) as unknown as PromiseLike<any>,
          8000
        ) as any;
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Invoice ${selectedInvoice ? 'updated' : 'created'} successfully`,
      });

      setShowInvoiceDialog(false);
      setSelectedInvoice(null);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error('[Invoices] save error:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await withTimeout(
        supabase
          .from('invoices')
          .delete()
          .eq('id', id) as unknown as PromiseLike<any>,
        8000
      ) as any;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      fetchInvoices();
    } catch (error) {
      console.error('[Invoices] delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email,
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount || 0,
      subtotal: invoice.subtotal,
      status: invoice.status || 'draft'
    });
    setShowInvoiceDialog(true);
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      total_amount: 0,
      tax_amount: 0,
      subtotal: 0,
      status: 'draft'
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices</p>
        </div>
        <Button onClick={() => setShowInvoiceDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{invoice.customer_name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(invoice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{invoice.customer_email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={invoice.status === 'paid' ? "default" : "secondary"}>
                    {invoice.status || 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span>${invoice.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice ? 'Update invoice details' : 'Create a new invoice'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                name="customer_name"
                autoComplete="name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                name="customer_email"
                autoComplete="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="Enter customer email"
              />
            </div>
            <div>
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                name="total_amount"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) }))}
                placeholder="Enter total amount"
              />
            </div>
            <div>
              <Label htmlFor="tax_amount">Tax Amount</Label>
              <Input
                id="tax_amount"
                type="number"
                name="tax_amount"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                value={formData.tax_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: parseFloat(e.target.value) }))}
                placeholder="Enter tax amount"
              />
            </div>
            <div>
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                name="subtotal"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                value={formData.subtotal}
                onChange={(e) => setFormData(prev => ({ ...prev, subtotal: parseFloat(e.target.value) }))}
                placeholder="Enter subtotal"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                type="text"
                name="status"
                autoComplete="off"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                placeholder="Enter status"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInvoice}>
                {selectedInvoice ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
