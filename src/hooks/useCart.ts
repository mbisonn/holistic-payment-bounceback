
import { useState, useCallback } from 'react';
import { CartItem } from '@/types/product-types';

export interface UseCartReturn {
  cart: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  return {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal
  };
};
