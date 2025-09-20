
import { CartItem } from '@/types/product-types';
import { validateCartItems } from './cart/cartValidationUtils';

export class CartUrlHandler {
  static parseCartFromUrl(): CartItem[] {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const cartData = urlParams.get('cart');
      
      if (cartData) {
        const decodedData = decodeURIComponent(cartData);
        const parsedData = JSON.parse(decodedData);
        
        if (Array.isArray(parsedData)) {
          const validation = validateCartItems(parsedData);
          if (validation.isValid && validation.items.length > 0) {
            console.log(`CartUrlHandler - Found ${validation.items.length} valid items from URL`);
            return validation.items;
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing cart from URL:', error);
      return [];
    }
  }

  static addCartToUrl(items: CartItem[]): void {
    try {
      const validation = validateCartItems(items);
      if (validation.isValid && validation.items.length > 0) {
        const cartData = encodeURIComponent(JSON.stringify(validation.items));
        const url = new URL(window.location.href);
        url.searchParams.set('cart', cartData);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.error('Error adding cart to URL:', error);
    }
  }

  static clearCartFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('cart');
    window.history.replaceState({}, '', url.toString());
  }
}
