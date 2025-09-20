import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { loadCartFromStorage } from '@/utils/cartDataUtils';

/**
 * A simplified hook for loading cart data for HomePage
 * that doesn't create circular dependencies
 */
export const useHomePageCart = () => {
  const { cart, updateCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCartData = async () => {
      try {
        setIsLoading(true);
        console.log("HomePage - Starting cart data initialization");
        
        // Load cart from storage
        const { items, source } = loadCartFromStorage();
        
        if (items && items.length > 0) {
          console.log(`HomePage - Found ${items.length} items from ${source}`);
          updateCart(items);
          
          // toast({
          //   title: "Cart Loaded",
          //   description: `${items.length} item(s) loaded successfully`
          // });
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadCartData();
  }, [updateCart, toast]);

  return { isLoading, isInitialized, cart };
};

export default useHomePageCart;
