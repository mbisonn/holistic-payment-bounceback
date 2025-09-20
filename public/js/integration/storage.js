
/**
 * Storage utilities for the sales page integration
 */

/**
 * Save cart data to all storage mechanisms
 * @param {Array} cartItems - The cart items to store
 */
export function saveToStorage(cartItems) {
  try {
    const cartData = JSON.stringify(cartItems);
    localStorage.setItem('systemeCart', cartData);
    localStorage.setItem('cart', cartData);
    localStorage.setItem('cartItems', cartData);
    localStorage.setItem('teneraCart', cartData);
    localStorage.setItem('pendingOrderData', cartData);
    
    console.log("Cart data stored in localStorage:", cartItems);
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
}

/**
 * Get cart data from storage
 * @returns {Array} The cart items from storage
 */
export function getFromStorage() {
  try {
    const storageKeys = ['systemeCart', 'cart', 'teneraCart', 'cartItems', 'pendingOrderData'];
    
    for (const key of storageKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    
    return [];
  } catch (e) {
    console.error("Error getting from storage:", e);
    return [];
  }
}
