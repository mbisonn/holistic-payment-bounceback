
import { CartItem } from '@/types/product-types';

// Check if we're in external checkout mode
export const isExternalCheckoutMode = (): boolean => {
  return localStorage.getItem('externalCheckoutMode') === 'true';
};

// Create external checkout URL with cart data
export const createExternalCheckoutUrl = (cartItems: CartItem[], customerInfo?: any): string => {
  const baseUrl = 'https://www.teneraholisticandwellness.com/order-payment';
  const params = new URLSearchParams();
  
  // Add cart data
  if (cartItems.length > 0) {
    params.set('cart', encodeURIComponent(JSON.stringify(cartItems)));
    params.set('total', cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toString());
  }
  
  // Add customer info if available
  if (customerInfo) {
    params.set('customerInfo', encodeURIComponent(JSON.stringify(customerInfo)));
  }
  
  params.set('checkout', 'true');
  params.set('timestamp', Date.now().toString());
  params.set('source', 'lovable_app');
  
  return `${baseUrl}?${params.toString()}`;
};
