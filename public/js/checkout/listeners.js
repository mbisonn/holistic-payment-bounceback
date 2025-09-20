
/**
 * Event listeners for the checkout system
 */

import { sendCartToCheckout } from './cartService.js';
import { getCartFromStorage } from './storage.js';

/**
 * Initialize checkout button listeners
 */
export function initCheckoutListeners() {
  const checkoutButtons = document.querySelectorAll('#checkout-btn, .checkout-button, [data-checkout="true"]');
  
  checkoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get current cart from storage
      const cartItems = getCartFromStorage();
      console.log('Checkout button clicked, sending cart:', cartItems);
      
      // Specify the redirect URL (Tenera's order form page)
      const teneraWebsiteUrl = 'https://www.teneraholisticandwellness.com/order-payment';
      
      // Process checkout and redirect to order payment page
      sendCartToCheckout(cartItems, teneraWebsiteUrl);
    });
  });
}
