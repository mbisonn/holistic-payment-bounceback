
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package, 
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface EnhancedDashboardProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    totalProducts: number;
    totalCustomers: number;
    averageOrderValue: number;
  };
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ stats }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-lemon-300 to-lemon-400",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-lemon-400 lemon-text-glow",
      trend: "+12.5%"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-blue-400",
      trend: "+8.2%"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-purple-400",
      trend: "+15.3%"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "from-orange-500 to-red-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-orange-400",
      trend: "+5.1%"
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: "from-teal-500 to-green-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-teal-400",
      trend: "+18.7%"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-yellow-400",
      trend: "-3.2%"
    },
    {
      title: "Avg Order Value",
      value: `₦${stats.averageOrderValue.toLocaleString()}`,
      icon: Star,
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-gray-800 to-gray-900",
      textColor: "text-indigo-400",
      trend: "+22.8%"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {statsCards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            transition: { type: "spring" as const, stiffness: 300 }
          }}
          className="relative"
        >
          <Card className={`bg-gradient-to-br ${card.bgColor} shadow-lg text-gray-100`}>
            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5`}
              animate={{
                opacity: [0.05, 0.1, 0.05],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${card.textColor}`}>{card.title}</CardTitle>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
              </motion.div>
            </CardHeader>
            
            <CardContent>
              <motion.div 
                className={`text-2xl font-bold ${card.textColor} mb-2 lemon-text-glow`}
                animate={{
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {card.value}
              </motion.div>
              
              <motion.div
                className={`flex items-center text-xs ${card.trend.startsWith('+') ? 'text-lemon-600 lemon-text-glow' : 'text-red-600'}`}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className={`w-3 h-3 mr-1 ${card.trend.startsWith('+') ? 'lemon-text-glow' : 'rotate-180'}`} />
                {card.trend} from last month
              </motion.div>
            </CardContent>
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-70"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}
            />
            <motion.div
              className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-50"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.4
              }}
            />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default EnhancedDashboard;
