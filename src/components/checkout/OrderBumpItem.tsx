
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/productUtils";
import { OrderBump } from '@/types/order-bump-types';

interface OrderBumpItemProps {
  orderBump: OrderBump;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
}

const OrderBumpItem: React.FC<OrderBumpItemProps> = ({
  orderBump,
  isSelected,
  onToggle
}) => {
  const { 
    title, 
    description,
    price, 
    image,
    image_url,
    discount_percentage = 0,
    product_id
  } = orderBump;
  
  // Use either image_url or image property, whichever is available
  const imageSource = image_url || image;
  
  const handleChange = (checked: boolean) => {
    onToggle(checked);
  };
  
  const discountedPrice = discount_percentage 
    ? price - (price * (discount_percentage / 100))
    : price;
  
  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${
      isSelected ? 'border-yellow-500 bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/25' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start gap-4 p-4">
        {imageSource && (
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={imageSource} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-black">{title}</h4>
            {discount_percentage > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {discount_percentage}% OFF
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{description || ''}</p>
          
          <div className="flex items-baseline mt-2">
            <span className="font-semibold text-black">{formatCurrency(discountedPrice)}</span>
            {discount_percentage > 0 && (
              <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(price)}</span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Checkbox
            id={`special-offer-${product_id || 'unknown'}`}
            checked={isSelected}
            onCheckedChange={handleChange}
            className="border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderBumpItem;
