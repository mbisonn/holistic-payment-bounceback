
/**
 * Cart integration with Lovable.dev checkout service
 * Handles messaging and synchronization of cart data
 */

import { log } from '../utils.js';
import { getCartData, saveCartToAllStorages } from './storage.js';
import { CONFIG } from '../config.js';

// Track message acknowledgements
let messageAcknowledged = false;
let messageSendAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;  // Increased from 3 to 5

/**
 * Set up message listeners for cart communication
 */
export function setupCartMessageListeners() {
  log("Setting up cart message listeners");

  window.addEventListener('message', function(event) {
    // Check if message is valid
    if (!event.data || typeof event.data !== 'object') return;

    log("Received message:", event.data.type || 'unknown type');

    switch (event.data.type) {
      case 'CART_RECEIVED':
        messageAcknowledged = true;
        log("Cart was successfully received by checkout app!");
        
        // Trigger any UI updates if needed
        const cartStatusElement = document.getElementById('cart-sync-status');
        if (cartStatusElement) {
          cartStatusElement.textContent = "✓ Cart synced with checkout";
          cartStatusElement.className = "sync-success";
        }
        break;

      case 'CART_READY':
        log("Checkout app is ready to receive cart data");
        
        // Send cart data if available
        const storedCart = getCartData();
        if (storedCart && storedCart.length > 0) {
          log("Found stored cart, sending to checkout app that's ready");
          sendCartDataToCheckoutApp(storedCart);
        }
        break;

      case 'ORDER_PROCESSED':
        log("Order was successfully processed");
        
        // Clear cart after successful order processing
        if (window.clearCart && typeof window.clearCart === 'function') {
          window.clearCart();
        }
        break;
        
      case 'CART_DATA':
        // Handle incoming cart data
        if (Array.isArray(event.data.cart) && event.data.cart.length > 0) {
          log("Received cart data from external source:", event.data.cart);
          saveCartToAllStorages(event.data.cart);
          
          // Send acknowledgment
          try {
            if (event.source && typeof event.source.postMessage === 'function') {
              event.source.postMessage({
                type: 'CART_RECEIVED',
                success: true,
                timestamp: new Date().toISOString()
              }, '*');
            }
          } catch (e) {
            log("Error sending acknowledgment:", e);
          }
        }
        break;
    }
  });

  // CRITICAL FIX: Send a ready signal repeatedly to ensure connection
  let readySendCount = 0;
  const sendReadySignal = () => {
    try {
      window.postMessage({
        type: "INTEGRATION_READY",
        timestamp: new Date().toISOString()
      }, '*');
      
      log(`Sent INTEGRATION_READY message (attempt ${++readySendCount})`);
      
      // Try to find any checkout iframes and send to them as well
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow.postMessage({
            type: "INTEGRATION_READY",
            timestamp: new Date().toISOString()
          }, '*');
          log(`Sent INTEGRATION_READY to iframe: ${iframe.src || 'unknown'}`);
        } catch (e) {
          // Silent fail for permission errors
        }
      });
      
      // Send to parent if we're in an iframe
      if (window !== window.parent) {
        window.parent.postMessage({
          type: "INTEGRATION_READY",
          timestamp: new Date().toISOString()
        }, '*');
        log("Sent INTEGRATION_READY to parent window");
      }
      
      // Also send CART_READY message
      window.postMessage({
        type: "CART_READY",
        timestamp: new Date().toISOString()
      }, '*');
      
      if (window !== window.parent) {
        window.parent.postMessage({
          type: "CART_READY",
          timestamp: new Date().toISOString()
        }, '*');
      }
    } catch (e) {
      log("Error sending ready message:", e);
    }
    
    // Continue sending ready signals for a while
    if (readySendCount < 5) {
      setTimeout(sendReadySignal, 1000);
    }
  };
  
  // Start sending ready signals
  setTimeout(sendReadySignal, 500);
  
  // Also check for URL parameters with cart data
  setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cart')) {
      try {
        const cartData = JSON.parse(decodeURIComponent(urlParams.get('cart') || '[]'));
        if (Array.isArray(cartData) && cartData.length > 0) {
          log("Found cart data in URL parameters, processing...");
          saveCartToAllStorages(cartData);
        }
      } catch (e) {
        log("Error parsing cart from URL parameters:", e);
      }
    }
  }, 1000);
}

/**
 * Send cart data to checkout app via postMessage
 * @param {Array} cartItems - Cart items to send
 * @returns {boolean} - Whether sending was attempted
 */
export function sendCartDataToCheckoutApp(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    log("No cart items to send");
    return false;
  }

  log("Attempting to send cart data to checkout app:", cartItems);
  messageAcknowledged = false;
  messageSendAttempts = 0;
  
  // Reset tracking variables
  messageAcknowledged = false;
  messageSendAttempts = 0;

  // CRITICAL FIX: Send to ALL possible targets for maximum reliability
  
  // 1. Try sending to the current window (for iframe scenarios)
  try {
    window.postMessage({
      type: 'CART_DATA',
      cart: cartItems,
      timestamp: new Date().toISOString(),
      source: 'tenera-integration'
    }, '*');
    
    // Also send with alternative format for compatibility
    window.postMessage({
      type: 'ADD_TO_CART',
      payload: cartItems,
      timestamp: new Date().toISOString(),
      source: 'tenera-integration'
    }, '*');
    
    log("Sent cart data via postMessage to current window");
  } catch (e) {
    log("Error sending postMessage to current window:", e);
  }

  // 2. Try to find and send to parent window if in an iframe
  if (window !== window.parent) {
    try {
      window.parent.postMessage({
        type: 'CART_DATA',
        cart: cartItems,
        timestamp: new Date().toISOString(),
        source: 'tenera-integration'
      }, '*');
      
      // Also send with alternative format for compatibility
      window.parent.postMessage({
        type: 'ADD_TO_CART',
        payload: cartItems,
        timestamp: new Date().toISOString(),
        source: 'tenera-integration'
      }, '*');
      
      log("Sent cart data to parent window");
    } catch (e) {
      log("Error sending to parent window:", e);
    }
  }

  // 3. Try to find and send to ALL iframes on the page
  try {
    const iframes = document.querySelectorAll('iframe');
    log(`Found ${iframes.length} iframes, attempting to send cart data to all`);
    
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({
          type: 'CART_DATA',
          cart: cartItems,
          timestamp: new Date().toISOString(),
          source: 'tenera-integration'
        }, '*');
        
        // Also send with alternative format for compatibility
        iframe.contentWindow.postMessage({
          type: 'ADD_TO_CART',
          payload: cartItems,
          timestamp: new Date().toISOString(),
          source: 'tenera-integration'
        }, '*');
        
        log("Sent cart data to iframe:", iframe.src);
      } catch (e) {
        // Silently fail for permission errors
      }
    });
  } catch (e) {
    log("Error sending to iframes:", e);
  }

  // 4. Save the data to multiple storage locations for retrieval
  try {
    saveCartToAllStorages(cartItems);
    log("Saved cart data to multiple storage locations for cross-window retrieval");
  } catch (e) {
    log("Error saving to storage:", e);
  }

  // Set up retry mechanism for unacknowledged messages
  scheduleRetryIfNeeded(cartItems);

  return true;
}

/**
 * Schedule retry for sending cart data if not acknowledged
 * @param {Array} cartItems - Cart items to retry sending
 */
function scheduleRetryIfNeeded(cartItems) {
  setTimeout(() => {
    if (!messageAcknowledged && messageSendAttempts < MAX_RETRY_ATTEMPTS) {
      messageSendAttempts++;
      log(`Cart data not acknowledged, retrying (attempt ${messageSendAttempts} of ${MAX_RETRY_ATTEMPTS})...`);
      
      // Try again with exponential backoff
      try {
        // Retry sending to all possible targets
        window.postMessage({
          type: 'CART_DATA',
          cart: cartItems,
          timestamp: new Date().toISOString(),
          source: 'tenera-integration-retry',
          attempt: messageSendAttempts
        }, '*');
        
        if (window !== window.parent) {
          window.parent.postMessage({
            type: 'CART_DATA',
            cart: cartItems,
            timestamp: new Date().toISOString(),
            source: 'tenera-integration-retry',
            attempt: messageSendAttempts
          }, '*');
        }
        
        // Try sending to iframes again
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            iframe.contentWindow.postMessage({
              type: 'CART_DATA',
              cart: cartItems,
              timestamp: new Date().toISOString(),
              source: 'tenera-integration-retry',
              attempt: messageSendAttempts
            }, '*');
          } catch (e) {
            // Silent fail
          }
        });
        
        // Schedule another check
        scheduleRetryIfNeeded(cartItems);
      } catch (e) {
        log("Error during retry:", e);
      }
    }
  }, 1000 * Math.pow(2, messageSendAttempts)); // Exponential backoff (1s, 2s, 4s)
}

/**
 * Initialize cart integration with checkout system
 */
export function initializeCartIntegration() {
  log("Initializing cart integration with checkout system");
  
  // Set up message listeners
  setupCartMessageListeners();
  
  // CRITICAL FIX: Check if there's data already in storage and send it
  setTimeout(() => {
    const storedCart = getCartData();
    if (storedCart && Array.isArray(storedCart) && storedCart.length > 0) {
      log("Found existing cart data during initialization, attempting to send");
      sendCartDataToCheckoutApp(storedCart);
    }
  }, 1500);
  
  // Check URL parameters for cart data
  setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cart')) {
      try {
        const cartData = JSON.parse(decodeURIComponent(urlParams.get('cart') || '[]'));
        if (Array.isArray(cartData) && cartData.length > 0) {
          log("Found cart data in URL parameters, processing...");
          sendCartDataToCheckoutApp(cartData);
        }
      } catch (e) {
        log("Error parsing cart from URL:", e);
      }
    }
  }, 1000);
}

/**
 * Process checkout with cart data
 * Handles saving to storage and sending to checkout
 * @param {Array} cartItems - Cart items for checkout
 */
export function processCartCheckout(cartItems) {
  // Standardize cart items format
  const standardizedItems = standardizeCartItems(cartItems);
  
  // Save to all storage locations
  saveCartToAllStorages(standardizedItems);
  
  // Send cart data via postMessage
  sendCartDataToCheckoutApp(standardizedItems);
  
  // Send data to API endpoint
  sendCartDataToAPI(standardizedItems);
}

/**
 * Standardize cart items to ensure consistent format
 * @param {Array} cartItems - Cart items to standardize
 * @returns {Array} - Standardized cart items
 */
function standardizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) return [];
  
  return cartItems.map(item => ({
    id: item.sku || item.id || 'unknown',
    sku: item.sku || item.id || 'unknown',
    name: item.name || 'Unknown Product',
    price: parseFloat(item.price) || 0,
    quantity: parseInt(item.quantity || item.defaultQuantity || 1, 10),
  }));
}

/**
 * Send cart data to API endpoint
 * @param {Array} cartItems - Cart items to send
 */
function sendCartDataToAPI(cartItems) {
  log("Sending cart data to API endpoint");
  
  fetch(CONFIG.ORDERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      source: window.location.href,
      redirectUrl: CONFIG.ORDER_PAYMENT_REDIRECT
    })
  })
  .then(response => response.json())
  .then(data => {
    log("API response:", data);
    
    // Redirect to checkout page if needed
    if (data && data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      window.location.href = CONFIG.ORDER_PAYMENT_REDIRECT;
    }
  })
  .catch(error => {
    console.error("Error sending cart data to API:", error);
    
    // Fallback to redirect with cart data in URL
    redirectToCheckoutPage(cartItems);
  });
}

/**
 * Redirect to checkout page with cart data
 * @param {Array} cartItems - Cart items to include in URL
 */
function redirectToCheckoutPage(cartItems) {
  try {
    const redirectUrl = new URL(CONFIG.ORDER_PAYMENT_REDIRECT);
    
    // Add cart data to URL as a fallback mechanism
    redirectUrl.searchParams.set('cart', JSON.stringify(cartItems));
    redirectUrl.searchParams.set('t', Date.now().toString());
    
    log("Redirecting to checkout page:", redirectUrl.toString());
    window.location.href = redirectUrl.toString();
  } catch (e) {
    log("Error redirecting to checkout:", e);
    window.location.href = CONFIG.ORDER_PAYMENT_REDIRECT;
  }
}
