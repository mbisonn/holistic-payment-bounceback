
/**
 * Messaging utilities for the sales page integration
 */

/**
 * Send cart data to all potential message targets
 * @param {Array} cartItems - The cart items to send
 * @param {string} redirectUrl - The URL to redirect to after checkout
 */
export function sendMessageToTargets(cartItems, redirectUrl) {
  // Send via postMessage API to handle iframe/window communication
  
  // Create the message payloads
  const cartDataMessage = {
    type: 'CART_DATA',
    cart: cartItems,
    redirectUrl: redirectUrl
  };
  
  const addToCartMessage = {
    type: 'ADD_TO_CART',
    payload: cartItems,
    redirectUrl: redirectUrl
  };
  
  // Send to current window for iframe communication
  window.postMessage(cartDataMessage, '*');
  window.postMessage(addToCartMessage, '*');
  
  // Send to parent window if in an iframe
  if (window !== window.parent) {
    window.parent.postMessage(cartDataMessage, '*');
    window.parent.postMessage(addToCartMessage, '*');
  }
  
  console.log("Sent cart data via postMessage");
}

/**
 * Send ready message to notify any listeners
 */
export function sendReadyMessage() {
  try {
    const readyMessage = {
      type: 'INTEGRATION_READY',
      ready: true,
      timestamp: new Date().toISOString()
    };
    
    // Send to current window
    window.postMessage(readyMessage, '*');
    
    // Send to parent if we're in an iframe
    if (window !== window.parent) {
      window.parent.postMessage(readyMessage, '*');
    }
    
    console.log("Sent INTEGRATION_READY message");
  } catch (e) {
    console.error("Failed to send ready message:", e);
  }
}
