import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, ImageOff } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem, formatCurrency } from '@/utils/productUtils';
import { Product } from '@/types/product-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  
  const handleAddToCart = () => {
    // Convert Product to CartItem by adding quantity
    const cartItem: CartItem = {
      ...product,
      quantity: product.defaultQuantity || 1
    };
    
    addToCart(cartItem);
  };
  
  // Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };
  
  const buttonVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image for product: ${product.name}`);
    setImageError(true);
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className="product-card overflow-hidden h-full flex flex-col border-green-100 hover:border-green-300 transition-colors duration-300 shadow-sm hover:shadow-md">
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          {!imageError ? (
            <motion.img
              variants={imageVariants}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageOff size={40} />
              <p className="mt-2 text-sm">Image not available</p>
            </div>
          )}
          
          {featured && (
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute top-2 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-r-full"
            >
              Featured
            </motion.div>
          )}
        </div>
        
        <CardContent className="pt-4 flex-grow">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-green-800">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          
          {product.benefits && (
            <ul className="mt-2 space-y-1">
              {product.benefits.slice(0, 1).map((benefit, idx) => (
                <li key={idx} className="text-xs text-green-700 line-clamp-1">
                  ✓ {benefit}
                </li>
              ))}
              {product.benefits.length > 1 && (
                <li className="text-xs text-green-600">
                  + {product.benefits.length - 1} more benefits
                </li>
              )}
            </ul>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 flex gap-2">
          <motion.div className="flex-1" variants={buttonVariants} whileTap="tap">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </motion.div>
          
          <motion.div className="flex-1" variants={buttonVariants} whileTap="tap">
            <Link to={`/product/${product.id}`} className="block w-full">
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Eye className="mr-2 h-4 w-4" /> Details
              </Button>
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
