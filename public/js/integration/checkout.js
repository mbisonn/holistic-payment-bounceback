
/**
 * Checkout functionality for the sales page integration
 */

import { saveToStorage } from './storage.js';
import { sendMessageToTargets } from './messaging.js';

/**
 * Initialize checkout functionality
 * @param {Object} config - Configuration object
 * @param {boolean} isFallback - Whether to use fallback mode
 */
export function initializeCheckout(config, isFallback = false) {
  // Expose functions to global scope
  window.teneraCheckout = {
    sendToCheckout: function(cartItems) {
      console.log("Processing checkout request with items:", cartItems);
      
      // Format cart items for consistent processing between systems
      const formattedCartItems = Array.isArray(cartItems) ? cartItems.map(item => ({
        id: item.sku || item.id,
        sku: item.sku || item.id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })) : [];
      
      // Store in all storage mechanisms for maximum compatibility
      saveToStorage(formattedCartItems);
      
      // Try to use browser's postMessage API to directly communicate with main app
      try {
        // Send to all potential receivers
        sendMessageToTargets(formattedCartItems, config.orderFormUrl);
      } catch (e) {
        console.error("Post message failed:", e);
      }
      
      // First send to our app to process the data, but tell it to redirect back to the order form
      const appUrl = config.checkoutAppUrl;
      const targetUrl = appUrl + '?redirect=true&redirectUrl=' + encodeURIComponent(config.orderFormUrl);
      
      // Add cart data to URL
      const cartData = JSON.stringify(formattedCartItems);
      const cartParam = encodeURIComponent(cartData);
      let finalUrl = targetUrl;
      
      if (!finalUrl.includes('cart=')) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'cart=' + cartParam;
      }
      
      // Add timestamp to bust cache
      finalUrl += '&t=' + new Date().getTime();
      
      // Use the sendCartToCheckout function from checkout.js if available
      if (window.sendCartToCheckout) {
        console.log("Using window.sendCartToCheckout function");
        // Send to our app first, but with redirect instructions
        window.sendCartToCheckout(formattedCartItems, finalUrl);
      } else {
        // Direct fallback approach
        console.log("Using direct redirection with URL parameters:", finalUrl);
        
        // Send data via fetch API to record the order
        fetch(config.dataPostUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: formattedCartItems,
            totalAmount: formattedCartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0),
            source: window.location.href
          })
        }).catch(err => console.error("Error sending cart data:", err));
        
        // Redirect to checkout page with instructions to redirect back to order form
        window.location.href = finalUrl;
      }
    },
    
    getCartData: function() {
      try {
        const data = localStorage.getItem('systemeCart');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error("Error getting cart data:", e);
        return [];
      }
    },
    
    clearCart: function() {
      localStorage.removeItem('systemeCart');
      localStorage.removeItem('cart');
      localStorage.removeItem('teneraCart');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('pendingOrderData');
      console.log("Cart cleared from all storage locations");
    }
  };

  // Set up debug utilities
  setupDebugUtilities();
}

/**
 * Set up debug utilities
 */
function setupDebugUtilities() {
  window.teneraDebug = {
    getStorageData: function() {
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
    
    sendTestCart: function() {
      window.teneraCheckout.sendToCheckout([
        {
          id: 'test_product',
          sku: 'test_product',
          name: 'Test Product',
          price: 15000,
          quantity: 1
        }
      ]);
    },
    
    check: function(type) {
      if (type === 'integration') {
        return {
          teneraCheckout: typeof window.teneraCheckout === 'object',
          sendCartToCheckout: typeof window.sendCartToCheckout === 'function',
          storage: localStorage.getItem('systemeCart') !== null
        };
      }
    }
  };
}
