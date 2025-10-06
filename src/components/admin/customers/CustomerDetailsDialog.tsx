import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyNGN } from '@/utils/currencyUtils';
import { format } from 'date-fns';

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    customer_email: string;
    customer_name: string;
    customer_phone?: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
    avg_order_value: number;
    orders?: any[];
    tags?: string[];
    products?: string[];
  };
}

export const CustomerDetailsDialog = ({ open, onOpenChange, customer }: CustomerDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="glass-secondary p-4 rounded-lg space-y-2">
              <div>
                <span className="text-gray-400 text-sm">Name:</span>
                <p className="text-white font-medium">{customer.customer_name}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <p className="text-white">{customer.customer_email}</p>
              </div>
              {customer.customer_phone && (
                <div>
                  <span className="text-gray-400 text-sm">Phone:</span>
                  <p className="text-white">{customer.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Purchase Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-secondary p-4 rounded-lg">
                <span className="text-gray-400 text-sm">Total Orders</span>
                <p className="text-2xl font-bold text-white">{customer.total_orders}</p>
              </div>
              <div className="glass-secondary p-4 rounded-lg">
                <span className="text-gray-400 text-sm">Total Spent</span>
                <p className="text-2xl font-bold text-white">{formatCurrencyNGN(customer.total_spent)}</p>
              </div>
              <div className="glass-secondary p-4 rounded-lg">
                <span className="text-gray-400 text-sm">Avg Order Value</span>
                <p className="text-2xl font-bold text-white">{formatCurrencyNGN(customer.avg_order_value)}</p>
              </div>
              <div className="glass-secondary p-4 rounded-lg">
                <span className="text-gray-400 text-sm">Last Order</span>
                <p className="text-lg font-semibold text-white">
                  {format(new Date(customer.last_order_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="border-white/20 text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Products Purchased */}
          {customer.products && customer.products.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Products Purchased</h3>
              <div className="flex flex-wrap gap-2">
                {customer.products.map((product, idx) => (
                  <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
