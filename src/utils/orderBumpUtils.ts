
import { CartItem } from '@/types/product-types';
import { OrderBump } from '@/types/order-bump-types';

export const getApplicableOrderBumps = (orderBumps: OrderBump[], cartItems: CartItem[]): OrderBump[] => {
  return orderBumps.filter(orderBump => {
    if (!orderBump.is_active) return false;
    
    // Check minimum cart value
    if (orderBump.min_cart_value) {
      const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (cartTotal < orderBump.min_cart_value) return false;
    }
    
    return true;
  });
};

export const addOrderBumpToCart = (cart: CartItem[], orderBump: OrderBump): CartItem[] => {
  const price = orderBump.discounted_price || orderBump.original_price;
  const orderBumpCartItem: CartItem = {
    id: `order-bump-${orderBump.id}`,
    sku: `order-bump-${orderBump.id}`,
    name: orderBump.title,
    price: price,
    quantity: 1,
    image: orderBump.image_url || orderBump.image || '',
    description: orderBump.description || undefined
  };

  return [...cart, orderBumpCartItem];
};

export const removeOrderBumpFromCart = (cart: CartItem[], orderBumpId: string): CartItem[] => {
  return cart.filter(item => item.id !== `order-bump-${orderBumpId}`);
};

export const calculateOrderBumpTotal = (cart: CartItem[]): number => {
  return cart
    .filter(item => item.id.startsWith('order-bump-'))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
