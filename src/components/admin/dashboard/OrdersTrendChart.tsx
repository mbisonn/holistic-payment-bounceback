
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { OrderTrendData } from '@/hooks/useDashboardData';

interface OrdersTrendChartProps {
  data: OrderTrendData[];
}

export const OrdersTrendChart = ({ data }: OrdersTrendChartProps) => {
  return (
    <>
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(-4px) rotate(-1deg); }
        }
      `}</style>
      
      <Card className="animate-[floatSlow_12s_ease-in-out_infinite] shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Orders Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="#08C25E" fill="#DCFCE7" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};
