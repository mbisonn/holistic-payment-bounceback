
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/productUtils';
import { OrderBump } from '@/types/order-bump-types';

interface OrderBumpCardProps {
  orderBump: OrderBump;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
}

const OrderBumpCard: React.FC<OrderBumpCardProps> = ({
  orderBump,
  isSelected,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    title, 
    description,
    original_price,
    discounted_price,
    image_url,
    product_id
  } = orderBump;
  
  const imageSource = image_url;
  const finalPrice = discounted_price || original_price;
  const hasDiscount = discounted_price && discounted_price < original_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((original_price - discounted_price) / original_price) * 100)
    : 0;
  
  const handleChange = (checked: boolean) => {
    onToggle(checked);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/25' 
          : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
      }`}
    >
      <Card className="border-0 bg-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {imageSource && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img 
                  src={imageSource} 
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-black leading-tight">
                    {title}
                  </h4>
                  
                  {hasDiscount && (
                    <Badge 
                      variant="outline" 
                      className="mt-2 bg-red-100 text-red-800 border-red-200 font-semibold"
                    >
                      {discountPercentage}% OFF - Limited Time!
                    </Badge>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <Checkbox
                    id={`order-bump-${product_id || 'unknown'}`}
                    checked={isSelected}
                    onCheckedChange={handleChange}
                    className="w-6 h-6 border-2 border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black rounded-md"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                {description && description.length > 100 ? (
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {isExpanded 
                        ? description 
                        : `${description.substring(0, 100)}...`
                      }
                      <button
                        onClick={toggleExpanded}
                        className="ml-2 text-green-600 hover:text-green-800 font-medium text-sm underline"
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {description || ''}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="text-2xl font-bold text-black">
                  {formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-black/60 line-through">
                    {formatCurrency(original_price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-3 right-3"
        >
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Added ✓
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderBumpCard;
