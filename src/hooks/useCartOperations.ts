
import { CartItem } from '@/types/product-types';
import { saveCartToAllStorages } from '@/utils/cart/cartStorageUtils';

export const useCartOperations = (
  currentCart: CartItem[],
  setCart: (cart: CartItem[]) => void
) => {
  const addToCart = (item: CartItem) => {
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);
    
    let updatedCart: CartItem[];
    if (existingItemIndex > -1) {
      updatedCart = currentCart.map((cartItem, index) =>
        index === existingItemIndex
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    } else {
      updatedCart = [...currentCart, item];
    }
    
    setCart(updatedCart);
    saveCartToAllStorages(updatedCart);
  };

  const removeFromCart = (id: string) => {
    const updatedCart = currentCart.filter(item => item.id !== id);
    setCart(updatedCart);
    saveCartToAllStorages(updatedCart);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const updatedCart = currentCart.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    saveCartToAllStorages(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    saveCartToAllStorages([]);
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    saveCartToAllStorages(newCart);
  };

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateCart,
  };
};
