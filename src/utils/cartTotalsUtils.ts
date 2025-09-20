
import { CartItem } from '@/types/product-types';

export const calculateCartTotals = (cart: CartItem[]) => {
  const productSubtotal = cart
    .filter(item => !item.id.startsWith('order-bump-'))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderBumpTotal = cart
    .filter(item => item.id.startsWith('order-bump-'))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    productSubtotal,
    orderBumpTotal,
    total: productSubtotal + orderBumpTotal
  };
};
