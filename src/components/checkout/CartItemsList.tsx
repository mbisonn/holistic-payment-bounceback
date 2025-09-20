
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CartItem, formatCurrency } from '@/utils/productUtils';
import { ImageOff } from 'lucide-react';

interface CartItemsListProps {
  cartItems: CartItem[];
}

const CartItemsList: React.FC<CartItemsListProps> = ({ cartItems }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Reset image errors when cart items change
  useEffect(() => {
    setImageErrors({});
  }, [cartItems]);
  
  const handleImageError = (itemId: string) => {
    console.error(`Failed to load image for product: ${itemId}`);
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Map of product IDs to fixed image URLs
  const productImageMap: Record<string, string> = {
    "blood-booster": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5740b3e4c_17.png",
    "cardio-sure": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5776804ef_20.png",
    "hormone-harmony": "https://d1yei2z3i6k35z.cloudfront.net/8917555/67e4000ae3cb2_hormoneharmony3.png",
    "prostatitis": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5788914a7_21.png",
    "prosta-vitality": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e883f4aebe_27.png",
    "optifertile": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56df4eea9_16.png",
    "liver-tea": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e57a19604c_22.png",
    "eye-shield": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56d34f3aa_15.png",
    "activated-charcoal": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e57d7a0d4f_23.png",
    "thyro-plus": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e575fa6bcd_191.png",
    "sugar-shield-plus": "https://d1yei2z3i6k35z.cloudfront.net/8917555/67a29f9d77cbc_SUGARSHIELDPLUS2.png",
    "nephro-care": "https://d1yei2z3i6k35z.cloudfront.net/8917555/67a1ae057756f_NEPHRO.jpg",
    "immuno-guard-plus": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56bf61a00_14.png",
    "vein-thrombus": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e8868780f0_30.png",
    "cardio-tincture": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e574fc28d2_18.png",
    "brain-booster": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e8883aeb12_31.png",
    "thyro-max": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e885da81e5_29.png",
    "immuno-guard": "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e884a068e5_28.png",
    "soursop": "https://d1yei2z3i6k35z.cloudfront.net/8917555/67d1bc4f4e920_soursopleaf.png"
  };

  // Function to get the correct image URL for a product
  const getCorrectImageUrl = (item: CartItem): string => {
    // Try to get the image from our map first
    const normalizedId = item.id.toLowerCase().replace(/\s+/g, '-');
    return productImageMap[normalizedId] || productImageMap[item.id] || item.image || '';
  };

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {cartItems.map((item) => (
        <motion.div 
          key={item.id} 
          className="flex items-center gap-3 text-sm p-2 rounded-md bg-white shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02, backgroundColor: '#f0fdf4' }}
        >
          {!imageErrors[item.id] ? (
            <img 
              src={getCorrectImageUrl(item)} 
              alt={item.name} 
              className="w-10 h-10 rounded-md object-cover border border-green-100"
              onError={() => handleImageError(item.id)}
              loading="eager"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
              <ImageOff size={16} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <span className="font-medium text-green-800">
              {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
          </div>
          <span className="font-medium text-green-700">{formatCurrency(item.price * item.quantity)}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default CartItemsList;
