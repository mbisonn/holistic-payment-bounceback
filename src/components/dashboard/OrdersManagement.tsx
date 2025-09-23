import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const OrdersManagement = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Orders Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-white/60 mb-4">
            Orders management features are being prepared for you.
          </p>
          <Button className="glass-button">
            Coming Soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersManagement;