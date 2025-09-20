
/**
 * Legacy version of sales page script for non-ES6 module environments
 * This contains the same functionality but in a single file
 */

// Original implementation kept intact for backward compatibility
(function() {
  // Configuration - set your checkout URL here
  const ORDER_PAYMENT_REDIRECT = "https://www.teneraholisticandwellness.com/order-payment";
  const ORDERS_API = "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders";
  const DEBUG = true;
  
  // Debug logging function
  function log(...args) {
    if (DEBUG) {
      console.log("🛒 [TeneraCheckout]:", ...args);
    }
  }
  
  log("Sales page integration script loaded");
  
  // Function to send cart to checkout and redirect to order payment page
  function sendCartToCheckout(cartItems) {
    // Ensure cartItems is an array
    if (!Array.isArray(cartItems)) {
      console.error("Cart items must be an array");
      return;
    }
    
    log("Processing checkout for items:", cartItems);

    // Ensure all items have a quantity property and standardize format
    const processedItems = cartItems.map(item => ({
      id: item.sku || item.id,
      sku: item.sku || item.id,
      name: item.name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity || item.defaultQuantity || 1),
    }));

    log("Processed cart items:", processedItems);
    
    // Save to localStorage with multiple keys to maximize compatibility
    const cartString = JSON.stringify(processedItems);
    localStorage.setItem('systemeCart', cartString);
    localStorage.setItem('cart', cartString);
    localStorage.setItem('teneraCart', cartString);
    localStorage.setItem('cartItems', cartString);
    
    log("Saved to multiple localStorage keys");
    
    // Send order data to API then redirect
    log("Sending cart data to orders API...");
    fetch(ORDERS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: processedItems,
        totalAmount: processedItems.reduce((sum, item) => {
          return sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1));
        }, 0),
        timestamp: new Date().toISOString(),
        source: window.location.href,
        redirectUrl: ORDER_PAYMENT_REDIRECT
      })
    })
    .then(response => response.json())
    .then(data => {
      log("API response:", data);
      
      // Always redirect to the order payment URL
      window.location.href = ORDER_PAYMENT_REDIRECT;
    })
    .catch(error => {
      console.error("Error sending cart data:", error);
      // Still redirect to the order payment page
      window.location.href = ORDER_PAYMENT_REDIRECT;
    });
  }

  // Attach event listeners to checkout buttons
  function attachCheckoutEvents() {
    log("Attaching checkout events to buttons");
    
    // Add event listeners to all buy now buttons
    const buyButtons = document.querySelectorAll('[data-product], .checkout-button, .buy-now, [data-checkout="true"], #checkout-btn');
    
    buyButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if this is a product-specific button
        const productId = this.getAttribute('data-product');
        
        if (productId && window.config && window.config.products && window.config.products[productId]) {
          // Single product checkout from data-product attribute
          const product = window.config.products[productId];
          const quantityInput = document.querySelector(`input[data-quantity="${productId}"]`);
          const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
          
          const cartItem = {
            sku: product.sku || productId,
            id: product.sku || productId,
            name: product.name,
            price: product.price,
            quantity: quantity
          };
          
          log(`Checkout clicked for specific product: ${product.name}`);
          sendCartToCheckout([cartItem]);
        } 
        else {
          // Generic checkout button - look for cart data
          log("Generic checkout button clicked");
          
          // Try to get cart from various sources
          let cart = null;
          
          // Try window.cart (from global scope)
          if (window.cart && Array.isArray(window.cart) && window.cart.length > 0) {
            cart = window.cart;
          }
          // Try localstorage
          else {
            const sources = ['systemeCart', 'cart', 'cartItems', 'teneraCart'];
            for (const source of sources) {
              try {
                const data = localStorage.getItem(source);
                if (data) {
                  const parsed = JSON.parse(data);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    cart = parsed;
                    break;
                  }
                }
              } catch (e) {
                console.error(`Error parsing ${source}:`, e);
              }
            }
          }
          
          if (cart && cart.length > 0) {
            // For cart checkout button, send message to iframe if available
            try {
              // Check if we're in a parent page
              if (window !== window.parent) {
                log("We are in an iframe, sending checkout message to parent");
                window.parent.postMessage({ 
                  type: 'CHECKOUT_BUTTON_CLICKED', 
                  cart: cart 
                }, '*');
                return; // Exit early, parent will handle redirect
              }
              
              // Check if there's an iframe we should notify
              const integrationsIframes = document.querySelectorAll('iframe[src*="teneraholisticandwellness"]');
              if (integrationsIframes.length > 0) {
                log("Found integration iframe, sending checkout message");
                integrationsIframes.forEach(iframe => {
                  iframe.contentWindow.postMessage({ 
                    type: 'CHECKOUT_BUTTON_CLICKED', 
                    cart: cart 
                  }, '*');
                });
              }
              
              // Still proceed with checkout in this window
              sendCartToCheckout(cart);
            } catch (e) {
              log("Error communicating with parent/iframe:", e);
              // Fallback to direct checkout
              sendCartToCheckout(cart);
            }
          } else {
            showNotification('Please add items to your cart before proceeding to checkout.', true);
          }
        }
      });
    });
    
    // Also listen for form submissions on forms with checkout class
    const checkoutForms = document.querySelectorAll('form.checkout-form');
    checkoutForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Try to get cart from various sources
        const cart = window.cart || JSON.parse(localStorage.getItem('systemeCart') || '[]');
        
        if (cart && cart.length > 0) {
          sendCartToCheckout(cart);
        } else {
          showNotification('Please add items to your cart before proceeding to checkout.', true);
        }
      });
    });
    
    // Listen for messages from iframe or parent
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'CART_RECEIVED') {
        log('Cart data was successfully received by integration');
        showNotification('Cart data processed successfully!');
      }
    });
  }
  
  // Function to show notification without shaking
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'smooth-notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = isError ? '#e74c3c' : '#27ae60';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1001';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.5s ease-in-out';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px; font-size: 20px;">${isError ? '⚠️' : '🛒'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation: fade in and slide down
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds with smooth animation
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  // Expose functions to global scope
  window.teneraCheckout = {
    sendToCheckout: sendCartToCheckout,
    showNotification: showNotification,
    getCartData: function() {
      try {
        return JSON.parse(localStorage.getItem('systemeCart') || '[]');
      } catch (e) {
        return [];
      }
    },
    clearCart: function() {
      localStorage.removeItem('systemeCart');
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('teneraCart');
      log("Cart cleared");
      return true;
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(attachCheckoutEvents, 1);
  } else {
    document.addEventListener('DOMContentLoaded', attachCheckoutEvents);
  }
})();
