
/**
 * Checkout integration script for Tenera Holistic and Wellness
 * 
 * This is a loader script that dynamically imports the modular
 * checkout system files while maintaining backward compatibility
 */

// Dynamically import our modular checkout system
(function() {
  console.log('Loading checkout integration modules...');
  
  // Load the main module script
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/js/checkout/index.js';
  document.head.appendChild(script);
  
  // Handle script load errors
  script.onerror = function() {
    console.error('Failed to load modular checkout system. Loading inline version.');
    
    // Define the sendCartToCheckout function inline for backward compatibility
    window.sendCartToCheckout = function(cart, redirectUrl) {
      try {
        console.log('Using fallback checkout process with cart:', cart);
        
        // Store cart data in localStorage
        const cartString = JSON.stringify(Array.isArray(cart) ? cart : []);
        localStorage.setItem('systemeCart', cartString);
        localStorage.setItem('cart', cartString);
        localStorage.setItem('teneraCart', cartString);
        localStorage.setItem('cartItems', cartString);
        localStorage.setItem('pendingOrderData', cartString);
        
        // Add cart data to URL as a fallback
        const url = new URL(redirectUrl || 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com');
        url.searchParams.set('cart', cartString);
        url.searchParams.set('t', Date.now().toString());
        
        // Redirect to checkout
        window.location.href = url.toString();
      } catch (e) {
        console.error('Error in fallback checkout:', e);
        window.location.href = redirectUrl || 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com';
      }
    };
    
    // Set up basic event handlers
    document.addEventListener('DOMContentLoaded', function() {
      const checkoutButtons = document.querySelectorAll('#checkout-btn, .checkout-button, [data-checkout="true"]');
      
      checkoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          let cartData = localStorage.getItem('systemeCart') || localStorage.getItem('cart');
          try {
            const cartItems = JSON.parse(cartData || '[]');
            window.sendCartToCheckout(cartItems, 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com?redirect=true&redirectUrl=' + 
                                     encodeURIComponent('https://www.teneraholisticandwellness.com/order-payment'));
          } catch (e) {
            console.error('Error handling checkout button:', e);
          }
        });
      });
    });
  };
})();
