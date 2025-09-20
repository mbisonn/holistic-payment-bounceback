import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductVariant } from '@/types/product-types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onVariantSelect: (variant: ProductVariant | null) => void;
  basePrice: number;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
  basePrice
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const calculateSavings = (variant: ProductVariant) => {
    const regularTotal = basePrice * variant.quantity_multiplier;
    const savings = regularTotal - variant.price;
    const savingsPercentage = Math.round((savings / regularTotal) * 100);
    return { savings, savingsPercentage };
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-lg">Package Options</h4>
      
      {/* Single item option */}
      <Button
        variant={!selectedVariant ? "default" : "outline"}
        onClick={() => onVariantSelect(null)}
        className="w-full p-4 h-auto flex justify-between items-center"
      >
        <div className="text-left">
          <div className="font-medium">Single Bottle</div>
          <div className="text-sm opacity-75">Regular Price</div>
        </div>
        <div className="text-right">
          <div className="font-bold">₦{basePrice.toLocaleString()}</div>
        </div>
      </Button>

      {/* Variant options */}
      {variants.map((variant) => {
        const { savings, savingsPercentage } = calculateSavings(variant);
        const isSelected = selectedVariant?.id === variant.id;

        return (
          <Button
            key={variant.id}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onVariantSelect(variant)}
            className="w-full p-4 h-auto flex justify-between items-center relative"
          >
            {variant.is_bumper_offer && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                BEST DEAL
              </Badge>
            )}
            
            <div className="text-left">
              <div className="font-medium">{variant.name}</div>
              <div className="text-sm opacity-75">
                {variant.quantity_multiplier} bottles
              </div>
              {savings > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  Save ₦{savings.toLocaleString()} ({savingsPercentage}%)
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="font-bold">₦{variant.price.toLocaleString()}</div>
              {savings > 0 && (
                <div className="text-xs line-through opacity-50">
                  ₦{(basePrice * variant.quantity_multiplier).toLocaleString()}
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default ProductVariantSelector;