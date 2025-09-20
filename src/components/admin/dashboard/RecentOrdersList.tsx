
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/productUtils';

interface Order {
  id: string;
  order_number?: string;
  total_amount: number;
  created_at: string | null;
  status?: string;
}

interface RecentOrdersListProps {
  orders: Order[];
}

export const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders }) => {
  return (
    <Card className="bg-gray-800 text-gray-100">
      <CardHeader>
        <CardTitle className="text-gray-200">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex justify-between items-center p-3 border border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-200">#{order.order_number || order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-400">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-100">{formatCurrency(order.total_amount)}</p>
                <p className="text-sm text-gray-400">{order.status || 'pending'}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
