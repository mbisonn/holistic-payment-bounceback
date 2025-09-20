
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';

export interface StatsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  activeDiscounts: number;
  orderChange: number;
  revenueChange: number;
  discountChange: number;
  formatCurrency: (amount: number) => string;
}

export const StatsCards = ({ 
  totalOrders, 
  totalRevenue, 
  activeDiscounts, 
  orderChange, 
  revenueChange, 
  discountChange, 
  formatCurrency 
}: StatsCardsProps) => {
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: orderChange,
      icon: ShoppingCart,
      animation: 'floatBounce',
      duration: '3s'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: revenueChange,
      icon: DollarSign,
      animation: 'floatSway',
      duration: '4s'
    },
    {
      title: 'Active Discounts',
      value: activeDiscounts.toString(),
      change: discountChange,
      icon: TrendingUp,
      animation: 'floatPulse',
      duration: '2.5s'
    }
  ];

  return (
    <>
      <style>{`
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-10px) scale(1.02); }
          50% { transform: translateY(-5px) scale(1.01); }
          75% { transform: translateY(-8px) scale(1.015); }
        }
        
        @keyframes floatSway {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          33% { transform: translateX(5px) rotate(1deg); }
          66% { transform: translateX(-5px) rotate(-1deg); }
        }
        
        @keyframes floatPulse {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.05) translateY(-3px); }
        }
      `}</style>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`shadow-lg hover:shadow-xl transition-all duration-300`}
              style={{
                animation: `${stat.animation} ${stat.duration} ease-in-out infinite`,
                animationDelay: `${index * 0.5}s`
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-lemon-400 lemon-text-glow">{stat.value}</div>
                <p className={`text-xs ${stat.change >= 0 ? 'text-lemon-600 lemon-text-glow' : 'text-red-600'}`}>
                  {stat.change >= 0 ? '+' : ''}{stat.change}% from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};
