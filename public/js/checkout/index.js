
/**
 * Main checkout script for Tenera Holistic and Wellness
 * This file orchestrates the checkout functionality and loads all required components
 */

import { initCheckoutListeners } from './listeners.js';
import { sendCartToCheckout } from './cartService.js';
import { sendReadyMessage, debugUtils } from './utils.js';

// Make core functions globally available
window.sendCartToCheckout = sendCartToCheckout;
window.checkoutDebug = debugUtils;

// Initialize checkout system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Checkout.js script loaded and initialized');
  
  // Set up checkout button listeners
  initCheckoutListeners();
  
  // Send a ready message to notify any listeners that checkout is ready
  sendReadyMessage();
});

// Also send ready message on full page load (in case DOM content loaded already fired)
window.addEventListener('load', function() {
  sendReadyMessage();
});
