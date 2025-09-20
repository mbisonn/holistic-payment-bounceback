
import { useState, useEffect, useMemo } from 'react';
import { CartItem } from '@/types/product-types';
import { saveCartToAllStorages } from '@/utils/cartDataUtils';

export const useCartState = (initialCart: CartItem[] = []) => {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  // Calculate total price of all items in cart
  const total = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  [cart]);
  
  // Calculate total quantity of items in cart
  const itemCount = useMemo(() => 
    cart.reduce((count, item) => count + item.quantity, 0),
  [cart]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      saveCartToAllStorages(cart);
    }
  }, [cart]);

  return { 
    cart, 
    setCart,
    total,
    itemCount
  };
};

export default useCartState;
