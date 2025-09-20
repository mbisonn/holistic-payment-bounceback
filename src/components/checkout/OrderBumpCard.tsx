import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderBump } from '@/types/order-bump-types';

interface OrderBumpCardProps {
  orderBump: OrderBump;
  isSelected: boolean;
  onToggle: (orderBump: OrderBump) => void;
}

const OrderBumpCard = ({ orderBump, isSelected, onToggle }: OrderBumpCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-yellow-400/30 shadow-2xl transform scale-105' 
            : 'bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 hover:shadow-lg'
        }`}
        onClick={() => onToggle(orderBump)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {orderBump.image_url && (
              <img 
                src={orderBump.image_url} 
                alt={orderBump.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {orderBump.title}
              </h3>
              <p className={`text-sm ${isSelected ? 'text-yellow-100' : 'text-gray-600'}`}>
                {orderBump.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {orderBump.original_price && orderBump.discounted_price && (
                  <span className={`text-sm line-through ${isSelected ? 'text-yellow-200' : 'text-gray-500'}`}>
                    ₦{orderBump.original_price.toLocaleString()}
                  </span>
                )}
                <span className={`font-bold text-xl ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  ₦{(orderBump.discounted_price || orderBump.original_price).toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              variant={isSelected ? "secondary" : "default"}
              size="sm"
              className={isSelected ? 'bg-white text-yellow-600 hover:bg-gray-100' : 'bg-yellow-600 text-white hover:bg-yellow-700'}
            >
              {isSelected ? 'Added!' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderBumpCard;