
/**
 * Cart storage functionality
 */

import { log } from '../utils.js';

/**
 * Get cart data from localStorage
 */
export function getCartData() {
  try {
    // Try multiple storage locations
    const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
    
    for (const key of storageKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            return parsedData;
          }
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    }
    
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Save cart data to all storage locations for maximum compatibility
 */
export function saveCartToAllStorages(items) {
  try {
    if (!Array.isArray(items)) {
      console.error("Items to save must be an array");
      return;
    }
    
    const cartString = JSON.stringify(items);
    localStorage.setItem('systemeCart', cartString);
    localStorage.setItem('cart', cartString);
    localStorage.setItem('teneraCart', cartString);
    localStorage.setItem('cartItems', cartString);
    localStorage.setItem('pendingOrderData', cartString);
    
    // Also save to sessionStorage for cross-page consistency
    sessionStorage.setItem('teneraCartData', cartString);
    
    log("Saved cart to multiple storage keys");
  } catch (e) {
    console.error("Error saving cart to storage:", e);
  }
}

/**
 * Clear cart data from all storage locations
 */
export function clearCart() {
  localStorage.removeItem('systemeCart');
  localStorage.removeItem('cart');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('teneraCart');
  localStorage.removeItem('pendingOrderData');
  sessionStorage.removeItem('teneraCartData');
  log("Cart cleared from all storage locations");
  return true;
}
