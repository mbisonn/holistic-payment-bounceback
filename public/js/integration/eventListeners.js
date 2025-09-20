
/**
 * Event listeners for the sales page integration
 */

import { sendReadyMessage, sendMessageToTargets } from './messaging.js';
import { getFromStorage } from './storage.js';

/**
 * Set up event listeners for the integration
 * @param {Object} config - Configuration object
 */
export function setupEventListeners(config) {
  // Send a "ready" message to notify any parent windows that we're initialized
  sendReadyMessage();
  
  // Set up event listener for messages from the checkout app
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CART_READY') {
      console.log("Received CART_READY from checkout app, checking for existing cart data");
      
      // If we have stored cart data, send it to the checkout app
      const storedCart = getFromStorage();
      if (Array.isArray(storedCart) && storedCart.length > 0) {
        console.log("Found stored cart with " + storedCart.length + " items, sending to checkout app");
        
        // Try to send to source window if possible
        if (event.source && typeof event.source.postMessage === 'function') {
          try {
            event.source.postMessage({
              type: 'CART_DATA',
              cart: storedCart,
              redirectUrl: config.orderFormUrl
            }, '*');
            console.log("Sent cart data to source window");
          } catch (e) {
            console.error("Error sending to source:", e);
          }
        }
        
        // Also broadcast to all possible targets as fallback
        sendMessageToTargets(storedCart, config.orderFormUrl);
      }
    }
  });
}
