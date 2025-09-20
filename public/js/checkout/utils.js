
/**
 * Utility functions for the checkout system
 */

/**
 * Send a ready message to notify any parent window that checkout is ready
 */
export function sendReadyMessage() {
  try {
    console.log("Checkout.js: Sending INTEGRATION_LOADED message");
    
    const readyMessage = {
      type: 'INTEGRATION_LOADED',
      ready: true,
      timestamp: new Date().toISOString()
    };
    
    // Send to current window
    window.postMessage(readyMessage, '*');
    
    // Send to parent window if we're in an iframe
    if (window !== window.parent) {
      window.parent.postMessage(readyMessage, '*');
    }
    
    // Also announce any existing cart data
    announceExistingCartData();
  } catch (e) {
    console.error("Error sending ready message:", e);
  }
}

/**
 * Check for and announce any existing cart data
 */
function announceExistingCartData() {
  let existingCart = null;
  
  // Try from localStorage
  try {
    const storageKeys = ['systemeCart', 'cart', 'teneraCart', 'cartItems'];
    for (const key of storageKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        existingCart = JSON.parse(data);
        if (Array.isArray(existingCart) && existingCart.length > 0) {
          console.log(`Found existing cart data in ${key}:`, existingCart);
          break;
        }
      }
    }
  } catch (e) {
    console.error("Error checking for existing cart:", e);
  }
  
  // If we found cart data, announce it
  if (existingCart && existingCart.length > 0) {
    console.log("Announcing existing cart data");
    
    // Send to current window
    window.postMessage({
      type: 'CART_DATA',
      cart: existingCart,
      timestamp: new Date().toISOString()
    }, '*');
    
    // Send to parent window if we're in an iframe
    if (window !== window.parent) {
      window.parent.postMessage({
        type: 'CART_DATA',
        cart: existingCart,
        timestamp: new Date().toISOString()
      }, '*');
    }
  }
}

/**
 * Debug utilities for the checkout system
 */
export const debugUtils = {
  checkStorage: function() {
    const result = {};
    ['systemeCart', 'cart', 'teneraCart', 'cartItems', 'pendingOrderData'].forEach(key => {
      try {
        result[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch (e) {
        result[key] = `Error parsing: ${e.message}`;
      }
    });
    return result;
  },
  
  sendTestMessage: function() {
    window.postMessage({
      type: 'CART_DATA',
      cart: [{ id: 'test_product', name: 'Test Product', price: 5000, quantity: 1 }],
      redirectUrl: 'https://www.teneraholisticandwellness.com/order-payment'
    }, '*');
    return 'Test message sent';
  }
};
