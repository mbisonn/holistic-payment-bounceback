
import { sendCartToCheckout } from './cartService.js';
import { log, showNotification } from './utils.js';

/**
 * Attach checkout event handlers to buttons
 */
export function attachCheckoutEvents() {
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
        
        // CRITICAL FIX: Ensure SKU is properly formatted for compatibility
        const cartItem = {
          sku: product.sku || productId,
          id: product.sku || productId,
          // Make a normalized version of the SKU (no dashes, lowercase)
          normalized_sku: (product.sku || productId).toString().toLowerCase().replace(/-/g, '_'),
          name: product.name,
          price: product.price,
          quantity: quantity
        };
        
        log(`Checkout clicked for specific product: ${product.name}`);
        
        // Check if there's a custom sendCartToCheckout function
        if (window.sendCartToCheckout && typeof window.sendCartToCheckout === 'function') {
          window.sendCartToCheckout([cartItem], window.config.orderFormUrl);
        } else {
          sendCartToCheckout([cartItem]);
        }
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
          // CRITICAL FIX: Normalize all SKUs in the cart for better matching
          cart = cart.map(item => {
            if (!item.normalized_sku && (item.sku || item.id)) {
              item.normalized_sku = (item.sku || item.id).toString().toLowerCase().replace(/-/g, '_');
            }
            return item;
          });
          
          // For cart checkout button, send message to iframe if available
          try {
            // Check if there's a custom sendCartToCheckout function
            if (window.sendCartToCheckout && typeof window.sendCartToCheckout === 'function') {
              window.sendCartToCheckout(cart, window.config.orderFormUrl);
              return;
            }
            
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
  
  // Listen for messages from iframe or parent
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CART_RECEIVED') {
      log('Cart data was successfully received by integration');
      showNotification('Cart data processed successfully!');
    }
    
    // CRITICAL FIX: Listen for integration ready messages and send cart data if available
    if (event.data && event.data.type === 'INTEGRATION_READY') {
      log('Integration ready message received, checking for cart data to send');
      
      const cartData = window.cart || null;
      if (cartData && Array.isArray(cartData) && cartData.length > 0) {
        log('Found cart data to send to ready integration');
        if (event.source && typeof event.source.postMessage === 'function') {
          event.source.postMessage({
            type: 'CART_DATA',
            cart: cartData
          }, '*');
        }
      }
    }
  });
}
