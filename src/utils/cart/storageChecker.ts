import { CartItem } from '@/types/product-types';

export const checkCartInStorage = () => {
  try {
    const keys = ['teneraCart', 'cartItems', 'systemeCart'];
    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (data && data !== 'null') {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error('Error checking cart storage:', error);
  }
  
  return null;
};

export const checkStoredCartData = (
  updateCart: (items: CartItem[]) => void
) => {
  const cartData = checkCartInStorage();
  if (cartData && cartData.length > 0) {
    console.log('Found cart data in storage:', cartData);
    updateCart(cartData);
  }
};
