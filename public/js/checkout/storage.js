
/**
 * Storage utilities for the checkout system
 */

/**
 * Save cart data to all storage locations for maximum compatibility
 * @param {Array} cart - Cart data to save
 */
export function saveToStorage(cart) {
  try {
    const cartString = JSON.stringify(cart);
    localStorage.setItem('systemeCart', cartString);
    localStorage.setItem('pendingOrderData', cartString);
    localStorage.setItem('cart', cartString);
    localStorage.setItem('cartItems', cartString);
    localStorage.setItem('teneraCart', cartString);
    
    console.log('Cart data saved to localStorage:', cart);
    
    // Also store in sessionStorage for cross-page consistency
    sessionStorage.setItem('teneraCartData', cartString);
  } catch (e) {
    console.error('Error saving cart data to localStorage:', e);
  }
}

/**
 * Get cart data from storage
 * @returns {Array} Cart data from storage, or empty array if none found
 */
export function getCartFromStorage() {
  try {
    const storageKeys = ['systemeCart', 'cart', 'teneraCart', 'cartItems', 'pendingOrderData'];
    
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
    console.error('Error getting cart data from storage:', e);
    return [];
  }
}

/**
 * Clear cart data from all storage locations
 */
export function clearStorage() {
  try {
    localStorage.removeItem('systemeCart');
    localStorage.removeItem('cart');
    localStorage.removeItem('teneraCart');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('pendingOrderData');
    sessionStorage.removeItem('teneraCartData');
    console.log('Cart cleared from all storage locations');
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
}
