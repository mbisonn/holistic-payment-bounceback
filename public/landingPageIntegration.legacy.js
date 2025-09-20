/**
 * Legacy version of the Tenera Holistic Payment Hub Integration
 * This file contains all the integration code in a single file for older browsers
 * that don't support ES modules.
 */
(function() {
  // Configuration
  const CONFIG = {
    API_ENDPOINT: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
    ORDER_PAYMENT_URL: "https://www.teneraholisticandwellness.com/order-payment",
    STORAGE_KEYS: {
      PRIMARY: "systemeCart",
      SECONDARY: ["cart", "cartItems", "teneraCart"]
    },
    DEBUG: true
  };

  // Debug function
  function log(...args) {
    if (CONFIG.DEBUG) {
      console.log("🔄 [TeneraIntegration]:", ...args);
    }
  }

  // Create a custom event to notify the parent page
  function notifyParent(eventName, data) {
    try {
      window.parent.postMessage({ type: eventName, ...data }, '*');
      log(`Event ${eventName} sent to parent`);
    } catch (e) {
      log("Error sending message to parent:", e);
    }
  }

  // Save cart data to multiple storage locations
  function saveToMultipleStorages(cartItems) {
    const cartString = JSON.stringify(cartItems);
    
    // Save to primary storage
    localStorage.setItem(CONFIG.STORAGE_KEYS.PRIMARY, cartString);
    
    // Save to all secondary storage locations
    CONFIG.STORAGE_KEYS.SECONDARY.forEach(key => {
      localStorage.setItem(key, cartString);
    });
    
    log("Cart saved to all storage locations");
  }

  // Format and standardize cart items
  function formatCartItems(cartItems) {
    if (!Array.isArray(cartItems)) {
      log("Warning: Cart items is not an array");
      return [];
    }
    
    return cartItems.map(item => ({
      id: item.sku || item.id || 'unknown',
      sku: item.sku || item.id || 'unknown',
      name: item.name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
    }));
  }

  // Send cart data to API
  function sendCartDataToApi(cartItems) {
    log("Sending cart data to API:", cartItems);
    
    const formattedItems = formatCartItems(cartItems);
    
    fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: formattedItems,
        source: document.referrer || window.location.href,
        timestamp: new Date().toISOString(),
        redirectUrl: CONFIG.ORDER_PAYMENT_URL
      })
    })
    .then(response => response.json())
    .then(data => {
      log("API response:", data);
    })
    .catch(error => {
      log("Fetch error:", error);
    });
  }

  // Get cart data from storage
  function getCartData() {
    try {
      // Try primary storage first
      let cartData = localStorage.getItem(CONFIG.STORAGE_KEYS.PRIMARY);
      
      // If not found, try secondary storage locations
      if (!cartData) {
        for (const key of CONFIG.STORAGE_KEYS.SECONDARY) {
          const data = localStorage.getItem(key);
          if (data) {
            cartData = data;
            break;
          }
        }
      }
      
      return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
      log("Error getting cart data:", e);
      return [];
    }
  }

  // Load cart data from storage and validate it
  function loadAndValidateCart() {
    // Try all possible cart storage keys
    const cartRaw = getCartData();
    
    if (!cartRaw || !Array.isArray(cartRaw) || cartRaw.length === 0) {
      log("Invalid cart data format or empty cart");
      return null;
    }
    
    // Format and standardize cart items
    const formattedItems = formatCartItems(cartRaw);
    
    // Save the standardized format back to storage
    saveToMultipleStorages(formattedItems);
    
    return formattedItems;
  }

  // Process cart data and redirect to checkout
  function proceedToCheckout() {
    const cartData = loadAndValidateCart();
    
    if (!cartData) {
      log("No valid cart data found, redirecting anyway");
      window.location.href = CONFIG.ORDER_PAYMENT_URL;
      return;
    }
    
    // Send cart data to API
    try {
      sendCartDataToApi(cartData);
      
      // Redirect to order payment page after a small delay
      setTimeout(() => {
        window.location.href = CONFIG.ORDER_PAYMENT_URL;
      }, 300);
    } catch (error) {
      log("Error processing cart data:", error);
      
      // Still redirect to order payment page
      window.location.href = CONFIG.ORDER_PAYMENT_URL;
    }
  }

  // Clear cart data from all storage locations
  function clearAllStorages() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PRIMARY);
    CONFIG.STORAGE_KEYS.SECONDARY.forEach(key => {
      localStorage.removeItem(key);
    });
    log("Cart cleared from all storage locations");
  }

  // Listen for messages from the parent page
  window.addEventListener('message', function(event) {
    // Safe check to prevent errors
    if (!event.data) return;
    
    log("Received message:", event.data);
    
    // Handle cart data
    if (event.data.type === 'CART_DATA') {
      log("Received cart data:", event.data.cart);
      
      if (Array.isArray(event.data.cart)) {
        // Store cart data in multiple storage keys for maximum compatibility
        saveToMultipleStorages(event.data.cart);
        
        // First, send to web app via API to ensure the data is stored server-side
        sendCartDataToApi(event.data.cart);
        
        // Notify when cart data is received
        notifyParent('CART_RECEIVED', { success: true });
      }
    }
    
    // Handle redirection request
    if (event.data.type === 'REDIRECT_TO_CHECKOUT') {
      log("Redirect request received");
      proceedToCheckout();
    }
    
    // Handle checkout button click
    if (event.data.type === 'CHECKOUT_BUTTON_CLICKED') {
      log("Checkout button clicked in parent page");
      
      // If cart data was provided with the checkout event, use it
      if (event.data.cart && Array.isArray(event.data.cart)) {
        saveToMultipleStorages(event.data.cart);
        log("Cart data saved from checkout event:", event.data.cart);
        
        // Send to API and proceed to checkout
        sendCartDataToApi(event.data.cart);
        setTimeout(() => proceedToCheckout(), 300); // Small delay to ensure data is sent
      } else {
        // Otherwise use the stored cart
        proceedToCheckout();
      }
    }
  });

  // Export functions to global scope
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
    }
  };
  
  log("Integration initialized successfully");
})();
