
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface OrderData {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export interface RecentOrdersTableProps {
  orders: OrderData[];
  formatCurrency: (amount: number) => string;
}

export const RecentOrdersTable = ({ orders, formatCurrency }: RecentOrdersTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-lemon-900 text-lemon-400 lemon-glow';
      case 'pending':
        return 'bg-yellow-900 text-yellow-400';
      case 'cancelled':
        return 'bg-red-900 text-red-400';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <>
      <style>{`
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(0.5deg); }
        }
      `}</style>
      
      <Card className="animate-[floatGentle_8s_ease-in-out_infinite] shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 text-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-200">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No orders found</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-200">{order.customer}</span>
                    <span className="text-sm text-gray-400">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-100">{formatCurrency(order.amount)}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
