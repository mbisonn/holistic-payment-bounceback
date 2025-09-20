
import { CONFIG } from './config.js';

/**
 * Debug logging function
 */
export function log(...args) {
  if (CONFIG.DEBUG) {
    console.log("🔄 [TeneraIntegration]:", ...args);
  }
}

/**
 * Send a message to the parent window
 */
export function notifyParent(eventName, data) {
  try {
    window.parent.postMessage({ type: eventName, ...data }, '*');
    log(`Event ${eventName} sent to parent`);
  } catch (e) {
    log("Error sending message to parent:", e);
  }
}

/**
 * Save cart data to multiple storage locations for maximum compatibility
 */
export function saveToMultipleStorages(cartItems) {
  const cartString = JSON.stringify(cartItems);
  
  // Save to primary storage
  localStorage.setItem(CONFIG.STORAGE_KEYS.PRIMARY, cartString);
  
  // Save to all secondary storage locations
  CONFIG.STORAGE_KEYS.SECONDARY.forEach(key => {
    localStorage.setItem(key, cartString);
  });
  
  log("Cart saved to all storage locations");
}

/**
 * Get cart data from local storage
 */
export function getCartFromStorage() {
  try {
    // Try all possible cart storage keys
    const cartKeys = [CONFIG.STORAGE_KEYS.PRIMARY, ...CONFIG.STORAGE_KEYS.SECONDARY];
    let cartDataStr = null;
    
    for (const key of cartKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        cartDataStr = data;
        log(`Found cart data in ${key}`);
        break;
      }
    }
    
    if (cartDataStr) {
      return JSON.parse(cartDataStr);
    }
    return null;
  } catch (e) {
    log("Error loading cart from storage:", e);
    return null;
  }
}

/**
 * Clear cart data from all storage locations
 */
export function clearAllStorages() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.PRIMARY);
  CONFIG.STORAGE_KEYS.SECONDARY.forEach(key => {
    localStorage.removeItem(key);
  });
  log("Cart cleared from all storage locations");
}

