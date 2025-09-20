
/**
 * Direct Integration Script for Tenera Holistic & Wellness Landing Page
 * This script establishes a direct connection between the landing page and checkout app
 */

(function() {
  // Configuration with the correct URLs
  const config = {
    checkoutAppUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com",
    orderPaymentUrl: "https://www.teneraholisticandwellness.com/order-payment",
    apiEndpoint: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
    debug: true
  };

  // Log helper function
  function log(message, data) {
    if (config.debug) {
      console.log(`[Tenera Integration] ${message}`, data || '');
    }
  }

  log("Integration script loaded with config:", config);

  /**
   * CRITICAL FIX: Enhanced function to send cart data to checkout and redirect
   * This function ensures cart data is properly transmitted and user is redirected
   */
  function sendCartToCheckout(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      log("No valid cart items to send");
      // Redirect anyway to avoid blocking checkout process
      window.location.href = config.orderPaymentUrl;
      return false;
    }

    log("Sending cart data to checkout:", cartItems);

    // 1. First normalize the cart items to ensure consistent format
    const formattedItems = cartItems.map(item => ({
      id: item.sku || item.id || '',
      sku: item.sku || item.id || '',
      name: item.name || 'Unknown Product',
      price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
      quantity: item.quantity ? parseInt(item.quantity) : 1
    }));

    // 2. Store cart data in multiple storage locations for maximum reliability
    const cartData = JSON.stringify(formattedItems);
    try {
      // Store in localStorage with multiple keys for compatibility
      localStorage.setItem('systemeCart', cartData);
      localStorage.setItem('cart', cartData);
      localStorage.setItem('cartItems', cartData);
      localStorage.setItem('teneraCart', cartData);
      localStorage.setItem('pendingOrderData', cartData);
      
      log("Cart data saved to multiple storage locations");
    } catch (e) {
      log("Error saving cart to storage:", e);
    }

    // 3. Try to communicate with checkout app via postMessage API
    try {
      // Send to current window
      window.postMessage({
        type: 'CART_DATA',
        cart: formattedItems,
        timestamp: new Date().toISOString(),
        source: 'landing-page-integration'
      }, '*');
      
      // Send to parent if we're in an iframe
      if (window !== window.parent) {
        window.parent.postMessage({
          type: 'CART_DATA',
          cart: formattedItems,
          timestamp: new Date().toISOString(),
          source: 'landing-page-integration'
        }, '*');
      }
      
      log("Sent cart data via postMessage to possible listeners");
    } catch (e) {
      log("Error with postMessage:", e);
    }

    // 4. Send data to API endpoint to ensure it's stored server-side
    fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: formattedItems,
        totalAmount: formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString(),
        source: window.location.href
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      log("API response:", data);
    })
    .catch(error => {
      log("Error sending cart data to API:", error);
    })
    .finally(() => {
      // 5. Redirect to order payment page with cart data in URL parameters
      try {
        // Encode cart data as URL parameter and add cache-busting timestamp
        const encodedCart = encodeURIComponent(JSON.stringify(formattedItems));
        const timestamp = Date.now();
        
        // Build the URL with cart data
        const redirectUrl = `${config.orderPaymentUrl}?cart=${encodedCart}&t=${timestamp}`;
        
        log("Redirecting to order payment page:", redirectUrl.substring(0, 100) + "...");
        
        // Perform the redirect
        window.location.href = redirectUrl;
      } catch (e) {
        log("Error during redirect:", e);
        // Fallback to basic redirect
        window.location.href = config.orderPaymentUrl;
      }
    });
    
    return true;
  }

  /**
   * Override the existing proceedToCheckout function in the landing page
   * This ensures our enhanced checkout process is used
   */
  function overrideCheckoutFunction() {
    if (window.proceedToCheckout) {
      log("Overriding proceedToCheckout function");
      
      // Store original function as fallback
      const originalProceedToCheckout = window.proceedToCheckout;
      
      // Replace with our enhanced version
      window.proceedToCheckout = function() {
        log("Enhanced proceedToCheckout called");
        
        // Get current cart data
        let cartItems = null;
        
        // First try to get cart from window.cart
        if (window.cart && Array.isArray(window.cart) && window.cart.length > 0) {
          cartItems = window.cart;
          log("Using window.cart data:", cartItems);
        } 
        // Then try to load from storage as fallback
        else {
          const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
          
          for (const key of storageKeys) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  cartItems = parsed;
                  log(`Found ${parsed.length} cart items in ${key}`);
                  break;
                }
              }
            } catch (e) {
              log(`Error parsing ${key}:`, e);
            }
          }
        }
        
        if (!cartItems || cartItems.length === 0) {
          log("No cart items found, falling back to original function");
          // Fall back to original function
          return originalProceedToCheckout();
        }
        
        return sendCartToCheckout(cartItems);
      };
      
      log("Checkout function overridden successfully");
    } else {
      log("No proceedToCheckout function found to override");
    }
  }

  /**
   * Set up checkout button click listener
   * This handles direct clicks on checkout buttons
   */
  function setupCheckoutButtonListener() {
    log("Setting up checkout button listener");
    
    document.addEventListener('click', function(event) {
      // Look for checkout button clicks
      if (event.target && 
          (event.target.id === 'checkout-btn' || 
           event.target.classList.contains('checkout-btn') ||
           (typeof event.target.className === 'string' && event.target.className.includes('checkout-btn')))) {
        
        log("Checkout button clicked");
        event.preventDefault();
        
        // Get cart data from all possible sources
        let cartItems = null;
        
        // First try window.cart (global variable)
        if (window.cart && Array.isArray(window.cart) && window.cart.length > 0) {
          cartItems = window.cart;
          log("Using global cart data:", cartItems);
        } 
        // If no global cart, try localStorage
        else {
          const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
          
          for (const key of storageKeys) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  cartItems = parsed;
                  log(`Found ${parsed.length} cart items in ${key}`);
                  break;
                }
              }
            } catch (e) {
              log(`Error parsing ${key}:`, e);
            }
          }
        }
        
        if (cartItems && cartItems.length > 0) {
          log("Found items in cart, sending to checkout");
          sendCartToCheckout(cartItems);
        } else {
          log("No cart items found, redirecting to order payment page anyway");
          window.location.href = config.orderPaymentUrl;
        }
      }
    });
  }

  // Expose functions globally
  window.teneraIntegration = {
    sendCartToCheckout: sendCartToCheckout,
    getConfig: function() {
      return { ...config };
    },
    setOrderPaymentUrl: function(url) {
      if (url) {
        config.orderPaymentUrl = url;
        log("Order payment URL updated:", url);
      }
    }
  };
  
  // Set up message listener for communication with checkout app
  function setupMessageListener() {
    window.addEventListener('message', function(event) {
      // Check for CART_READY message from checkout app
      if (event.data && event.data.type === 'CART_READY') {
        log("Received CART_READY message from checkout app");
        
        // Get cart data
        let cartItems = null;
        
        // Try window.cart first
        if (window.cart && Array.isArray(window.cart) && window.cart.length > 0) {
          cartItems = window.cart;
        } 
        // Then try localStorage
        else {
          const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
          for (const key of storageKeys) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  cartItems = parsed;
                  break;
                }
              }
            } catch (e) {
              log(`Error parsing ${key}:`, e);
            }
          }
        }
        
        // If we have cart data, send it to the source that sent CART_READY
        if (cartItems && cartItems.length > 0) {
          log("Sending cart data in response to CART_READY:", cartItems);
          
          if (event.source && typeof event.source.postMessage === 'function') {
            try {
              event.source.postMessage({
                type: 'CART_DATA',
                cart: cartItems,
                timestamp: new Date().toISOString(),
                source: 'landing-page-integration'
              }, '*');
              
              log("Sent cart data to CART_READY source");
            } catch (e) {
              log("Error sending cart data to source:", e);
            }
          }
        }
      }
      
      // Check for cart received confirmation
      if (event.data && event.data.type === 'CART_RECEIVED') {
        log("Cart data was successfully received by checkout app");
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      overrideCheckoutFunction();
      setupCheckoutButtonListener();
      setupMessageListener();
    });
  } else {
    overrideCheckoutFunction();
    setupCheckoutButtonListener();
    setupMessageListener();
  }
  
  // Send an initialization complete message
  log("Integration script initialization complete");
})();
