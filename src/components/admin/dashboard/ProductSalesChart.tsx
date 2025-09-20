
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

export interface ProductSalesData {
  name: string;
  value: number;
  color: string;
}

interface ProductSalesChartProps {
  data: ProductSalesData[];
}

export const ProductSalesChart = ({ data }: ProductSalesChartProps) => {
  return (
    <>
      <style>{`
        @keyframes floatCircular {
          0% { transform: rotate(0deg) translateX(5px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(5px) rotate(-360deg); }
        }
      `}</style>
      
      <Card className="animate-[floatCircular_20s_linear_infinite] shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Product Sales Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};
