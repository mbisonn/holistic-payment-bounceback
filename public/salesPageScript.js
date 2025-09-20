
/**
 * Integration script for Tenera Holistic & Wellness sales page
 * Use this script to connect your sales page to the payment hub
 */

(function() {
  console.log("Tenera sales page integration initializing...");
  
  // Configuration for the integration
  const config = {
    orderPaymentUrl: "https://www.teneraholisticandwellness.com/order-payment",
    apiEndpoint: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
    debug: true
  };
  
  // Global object to expose functionality
  window.teneraCheckout = {
    sendToCheckout: function(cartItems) {
      sendCartToCheckout(cartItems);
    }
  };
  
  // Main function to send cart data to checkout
  function sendCartToCheckout(cartItems) {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Cannot checkout with empty cart");
      return;
    }
    
    console.log("Sending cart to checkout:", cartItems);
    
    // Standardize cart items format
    const standardizedItems = cartItems.map(item => ({
      id: item.sku || item.id,
      sku: item.sku || item.id,
      name: item.name,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      quantity: parseInt(item.quantity || 1, 10)
    }));
    
    // Save to all storage locations
    const cartData = JSON.stringify(standardizedItems);
    localStorage.setItem('systemeCart', cartData);
    localStorage.setItem('cart', cartData);
    localStorage.setItem('cartItems', cartData);
    localStorage.setItem('teneraCart', cartData);
    localStorage.setItem('pendingOrderData', cartData);
    
    // Attempt to use postMessage to communicate with the checkout app
    try {
      console.log("Sending cart data via postMessage");
      
      // Send to current window
      window.postMessage({
        type: 'CART_DATA',
        cart: standardizedItems,
        timestamp: new Date().toISOString()
      }, '*');
      
      // Also try alternative format
      window.postMessage({
        type: 'ADD_TO_CART',
        payload: standardizedItems,
        timestamp: new Date().toISOString()
      }, '*');
      
      // If this script is running in the parent of an iframe containing the checkout app
      const checkoutFrames = document.querySelectorAll('iframe');
      checkoutFrames.forEach(frame => {
        try {
          frame.contentWindow.postMessage({
            type: 'CART_DATA',
            cart: standardizedItems,
            timestamp: new Date().toISOString()
          }, '*');
          
          // Also try alternative format
          frame.contentWindow.postMessage({
            type: 'ADD_TO_CART',
            payload: standardizedItems,
            timestamp: new Date().toISOString()
          }, '*');
        } catch (e) {
          // Silently fail - this is expected if iframe has different origin
        }
      });
    } catch (e) {
      console.error("Error sending cart via postMessage:", e);
    }
    
    // Always send data to API as fallback
    fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: standardizedItems,
        totalAmount: standardizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString(),
        source: window.location.href
      })
    })
    .then(response => response.json())
    .then(() => {
      console.log("Order data sent to API");
      
      // Redirect to checkout page with cart data in URL
      const encodedCart = encodeURIComponent(JSON.stringify(standardizedItems));
      window.location.href = `${config.orderPaymentUrl}?cart=${encodedCart}&t=${Date.now()}`;
    })
    .catch(error => {
      console.error('Error sending order data:', error);
      
      // Still redirect to checkout with cart data in URL
      const encodedCart = encodeURIComponent(JSON.stringify(standardizedItems));
      window.location.href = `${config.orderPaymentUrl}?cart=${encodedCart}&t=${Date.now()}`;
    });
  }
  
  // Make function globally available for direct use
  window.sendCartToCheckout = sendCartToCheckout;
  
  // Listen for cart messages
  window.addEventListener('message', function(event) {
    if (!event.data || typeof event.data !== 'object') return;
    
    console.log("Received message in salesPageScript:", event.data.type);
    
    // Handle CART_READY message from checkout app
    if (event.data.type === 'CART_READY') {
      console.log("Checkout app is ready to receive cart data");
      
      // Check if we have cart data in localStorage
      try {
        const storedCart = localStorage.getItem('systemeCart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            console.log("Found stored cart data, sending to checkout app:", parsedCart);
            sendCartToCheckout(parsedCart);
          }
        }
      } catch (e) {
        console.error("Error sending stored cart:", e);
      }
    }
    
    // Handle CHECKOUT_BUTTON_CLICKED message
    if (event.data.type === 'CHECKOUT_BUTTON_CLICKED') {
      console.log("Checkout button clicked in parent window");
      
      // Check if we have cart data
      try {
        const storedCart = localStorage.getItem('systemeCart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            console.log("Found stored cart data, sending to checkout:", parsedCart);
            sendCartToCheckout(parsedCart);
          }
        }
      } catch (e) {
        console.error("Error handling checkout button click:", e);
      }
    }
  });
  
  // Function to override the proceedToCheckout in landing page
  if (typeof window.proceedToCheckout === 'function') {
    console.log("Overriding existing proceedToCheckout function");
    
    // Store original function
    const originalCheckout = window.proceedToCheckout;
    
    // Replace with our implementation
    window.proceedToCheckout = function() {
      console.log("Enhanced proceedToCheckout called");
      
      // Get cart data from wherever the landing page stores it
      let cartItems = [];
      
      // Try to get from 'cart' variable if it exists
      if (typeof window.cart !== 'undefined' && Array.isArray(window.cart)) {
        console.log("Using global cart variable");
        cartItems = window.cart;
      } else {
        // Try to get from localStorage
        try {
          const storedCart = localStorage.getItem('systemeCart');
          if (storedCart) {
            cartItems = JSON.parse(storedCart);
          }
        } catch (e) {
          console.error("Error getting cart data:", e);
        }
      }
      
      if (cartItems && cartItems.length > 0) {
        // Use our implementation
        sendCartToCheckout(cartItems);
      } else {
        // Fall back to original implementation
        originalCheckout();
      }
    };
  }
  
  console.log("Tenera sales page integration loaded successfully");
})();
