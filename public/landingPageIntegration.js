import { CONFIG } from './integration/config.js';
import { log, notifyParent, saveToMultipleStorages, clearAllStorages } from './integration/utils.js';
import { formatCartItems, sendCartDataToApi, proceedToCheckout, getCartData } from './integration/cartService.js';

/**
 * Initialize the Tenera Holistic Payment Hub Integration
 */
export function initIntegration() {
  log("Tenera Holistic Payment Hub Integration Initialized");

  // Listen for messages from the parent page
  setupMessageListeners();
  
  // Export functions to global scope
  exportGlobalFunctions();
  
  // CRITICAL FIX: Announce that integration is ready immediately and repeatedly
  const sendReadyMessage = () => {
    notifyParent('INTEGRATION_READY', {});
    log("Sent INTEGRATION_READY message");
  };
  
  // Send the ready message at different intervals for reliability
  [100, 500, 1000, 2000].forEach(delay => {
    setTimeout(sendReadyMessage, delay);
  });
}

/**
 * Set up message event listeners
 */
function setupMessageListeners() {
  window.addEventListener('message', function(event) {
    // Safe check to prevent errors
    if (!event.data) return;
    
    log("Received message:", event.data);
    
    // Handle cart data
    if (event.data.type === 'CART_DATA') {
      handleCartDataMessage(event);
    }
    
    // Handle redirection request
    if (event.data.type === 'REDIRECT_TO_CHECKOUT') {
      log("Redirect request received");
      proceedToCheckout();
    }
    
    // Handle checkout button click
    if (event.data.type === 'CHECKOUT_BUTTON_CLICKED') {
      handleCheckoutButtonClicked(event);
    }
    
    // CRITICAL FIX: Handle cart ready message from checkout app
    if (event.data.type === 'CART_READY') {
      log("Received CART_READY message, sending any pending cart data");
      const cartData = getCartData();
      if (cartData && Array.isArray(cartData) && cartData.length > 0) {
        log("Found pending cart data, sending to ready checkout app");
        if (event.source && typeof event.source.postMessage === 'function') {
          try {
            event.source.postMessage({
              type: 'CART_DATA',
              cart: cartData
            }, '*');
            log("Sent pending cart data to checkout app");
          } catch (e) {
            log("Error sending cart to source:", e);
          }
        }
      }
    }
  });

  // Send a ready signal to notify integration is loaded
  setTimeout(() => {
    log("Sending INTEGRATION_READY message to parent");
    window.parent.postMessage({ type: "INTEGRATION_READY" }, "*");
  }, 500);
}

/**
 * Handle the CART_DATA message type
 */
function handleCartDataMessage(event) {
  log("Received cart data:", event.data.cart);
  
  if (Array.isArray(event.data.cart)) {
    // Store cart data in multiple storage locations for maximum compatibility
    saveToMultipleStorages(event.data.cart);
    
    // First, send to web app via API to ensure the data is stored server-side
    sendCartDataToApi(event.data.cart);
    
    // Notify when cart data is received
    notifyParent('CART_RECEIVED', { success: true });
  }
}

/**
 * Handle the CHECKOUT_BUTTON_CLICKED message type
 */
function handleCheckoutButtonClicked(event) {
  log("Checkout button clicked in parent page");
  
  // CRITICAL FIX: Enhanced error handling and logging for checkout flow
  try {
    // If cart data was provided with the checkout event, use it
    if (event.data.cart && Array.isArray(event.data.cart)) {
      log("Cart data provided with checkout event, saving to storage");
      saveToMultipleStorages(event.data.cart);
      
      // Send to API and proceed to checkout
      sendCartDataToApi(event.data.cart).then(() => {
        log("Cart data sent to API successfully, proceeding to checkout");
        setTimeout(() => proceedToCheckout(), 300);
      }).catch(err => {
        log("Error sending cart data to API:", err);
        // Still proceed to checkout even if API call fails
        setTimeout(() => proceedToCheckout(), 300);
      });
    } else {
      // Otherwise use the stored cart
      log("No cart data with event, using stored cart data");
      proceedToCheckout();
    }
  } catch (error) {
    log("Error processing checkout:", error);
    // Fallback - redirect to checkout page directly
    window.location.href = CONFIG.ORDER_PAYMENT_URL;
  }
}

/**
 * Export functions to global scope
 */
function exportGlobalFunctions() {
  window.teneraPayment = {
    checkout: proceedToCheckout,
    getCartData: getCartData,
    clearCart: function() {
      clearAllStorages();
      log("Cart cleared");
      return true;
    },
    setCheckoutUrl: function(url) {
      if (url) {
        CONFIG.ORDER_PAYMENT_URL = url;
        log(`Checkout URL updated to: ${url}`);
        return true;
      }
      return false;
    },
    // CRITICAL FIX: Enhanced cart data sending with better compatibility
    sendCartData: function(cartData) {
      if (Array.isArray(cartData)) {
        log("Manually sending cart data:", cartData);
        
        // Save to storage first
        saveToMultipleStorages(cartData);
        
        // Broadcast to all possible targets
        try {
          // Send to parent if we're in an iframe
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'CART_DATA',
              cart: cartData
            }, '*');
          }
          
          // Send to window itself (for event listeners in same window)
          window.postMessage({
            type: 'CART_DATA',
            cart: cartData
          }, '*');
          
          // Find any Tenera checkout iframes and send directly
          const checkoutIframes = document.querySelectorAll('iframe[src*="teneraholisticandwellness"]');
          checkoutIframes.forEach(iframe => {
            try {
              iframe.contentWindow.postMessage({
                type: 'CART_DATA',
                cart: cartData
              }, '*');
            } catch (e) {
              log("Error sending to iframe:", e);
            }
          });
          
          return true;
        } catch (e) {
          log("Error sending cart messages:", e);
          return false;
        }
      }
      return false;
    }
  };
}

// Self-executing function to initialize the integration
(function() {
  initIntegration();
})();

// --- Updated Checkout Handler for URL-based cart passing ---
function setupCheckoutButton() {
  const PAYMENT_PAGE_URL = "https://www.teneraholisticandwellness.com/order-payment";
  const checkoutBtn = document.getElementById('checkout-btn');
  if (!checkoutBtn) return;
  checkoutBtn.addEventListener('click', function() {
    const cartData = window.teneraCart ? window.teneraCart.getCart() : [];
    const cartParam = encodeURIComponent(JSON.stringify(cartData));
    window.location.href = `${PAYMENT_PAGE_URL}?cart=${cartParam}`;
  });
}
// Call on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCheckoutButton);
} else {
  setupCheckoutButton();
}
