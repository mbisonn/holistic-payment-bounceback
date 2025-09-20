
import React, { createContext, useContext, useRef } from 'react';
import { CartItem } from '@/types/product-types';
import { useToast } from '@/hooks/use-toast';
import { useCartState } from '@/hooks/useCartState';
import { useCartOperations } from '@/hooks/useCartOperations';
import { useCartMessageHandler } from '@/hooks/useCartMessageHandler';
import { useCartInitializer } from '@/hooks/useCartInitializer';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  updateCart: (newCart: CartItem[]) => void;
  setCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the toast API
  const toastApi = useToast();
  
  // Create a ref for tracking initial load state
  const isInitialLoad = useRef(true);
  
  // Initialize cart state
  const { cart, setCart, total, itemCount } = useCartState([]);
  
  // Initialize cart operations
  const { addToCart, removeFromCart, updateQuantity, clearCart, updateCart } = useCartOperations(cart, setCart);
  
  // Set up cart initialization from storage, URL, etc.
  useCartInitializer(updateCart, toastApi, isInitialLoad);
  
  // Set up external message handling for cart data
  useCartMessageHandler(updateCart, toastApi);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        updateCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
