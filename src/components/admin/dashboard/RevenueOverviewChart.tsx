
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { RevenueTrendData } from '@/hooks/useDashboardData';

interface RevenueOverviewChartProps {
  data: RevenueTrendData[];
  formatCurrency: (amount: number) => string;
}

export const RevenueOverviewChart = ({ data, formatCurrency }: RevenueOverviewChartProps) => {
  return (
    <>
      <style>{`
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
      `}</style>
      
      <Card className="animate-[floatReverse_10s_ease-in-out_infinite_2s] shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('en-NG', { 
                    notation: 'compact',
                    style: 'currency',
                    currency: 'NGN',
                    maximumFractionDigits: 0,
                    compactDisplay: 'short'
                  }).format(value)
                } 
              />
              <Tooltip 
                formatter={(value: any) => 
                  [formatCurrency(value), "Amount"]
                } 
              />
              <Bar dataKey="amount" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};
