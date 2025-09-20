
import { CartItem } from '@/types/product-types';
import { validateCartItems } from './cart/cartValidationUtils';

export class CartStorageHandler {
  private static instance: CartStorageHandler;
  
  static getInstance(): CartStorageHandler {
    if (!CartStorageHandler.instance) {
      CartStorageHandler.instance = new CartStorageHandler();
    }
    return CartStorageHandler.instance;
  }

  loadFromStorage(): CartItem[] {
    try {
      const keys = ['teneraCart', 'systemeCart', 'cartItems', 'pendingOrderData'];
      
      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
              const validation = validateCartItems(parsedData);
              if (validation.isValid && validation.items.length > 0) {
                console.log(`CartStorageHandler - Found ${validation.items.length} valid items in ${key}`);
                return validation.items;
              }
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e);
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return [];
    }
  }

  saveToStorage(items: CartItem[]): void {
    try {
      const validation = validateCartItems(items);
      if (validation.isValid) {
        const cartString = JSON.stringify(validation.items);
        
        // Save to multiple locations for compatibility
        localStorage.setItem('teneraCart', cartString);
        localStorage.setItem('systemeCart', cartString);
        localStorage.setItem('cartItems', cartString);
        
        console.log(`CartStorageHandler - Saved ${validation.items.length} items to storage`);
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  clearStorage(): void {
    const keys = ['teneraCart', 'systemeCart', 'cartItems', 'pendingOrderData'];
    keys.forEach(key => localStorage.removeItem(key));
  }
}
