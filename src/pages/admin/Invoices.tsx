import { useState } from 'react';
import { FileText, Download, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date: string;
}

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock invoices data since the table doesn't exist
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      amount: 150000,
      status: 'paid',
      created_at: '2024-01-15T10:00:00Z',
      due_date: '2024-01-30T00:00:00Z'
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      amount: 75000,
      status: 'sent',
      created_at: '2024-01-20T10:00:00Z',
      due_date: '2024-02-05T00:00:00Z'
    }
  ];

  const filteredInvoices = mockInvoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Invoices
          </h1>
          <p className="text-muted-foreground">Manage customer invoices and billing</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                  <CardDescription>{invoice.customer_name} • {invoice.customer_email}</CardDescription>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₦{invoice.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No invoices found</p>
        </div>
      )}
    </div>
  );
};

export default Invoices;