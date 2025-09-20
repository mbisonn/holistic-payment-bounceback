
/**
 * Cart checkout functionality
 */

import { CONFIG } from '../config.js';
import { log } from '../utils.js';
import { saveCartToAllStorages } from './storage.js';
import { sendCartDataToCheckoutApp, processCartCheckout } from './integration.js';

/**
 * Send cart data to checkout and redirect to payment page
 */
export function sendCartToCheckout(cartItems) {
  // Ensure cartItems is an array
  if (!Array.isArray(cartItems)) {
    console.error("Cart items must be an array");
    return;
  }
  
  log("Processing checkout for items:", cartItems);

  // Ensure all items have a quantity property and standardize format
  const processedItems = cartItems.map(item => ({
    id: item.sku || item.id || 'unknown',
    sku: item.sku || item.id || 'unknown',
    name: item.name || 'Unknown Product',
    price: parseFloat(item.price) || 0,
    quantity: parseInt(item.quantity || item.defaultQuantity || 1),
  }));

  log("Processed cart items:", processedItems);
  
  // Save to localStorage
  const cartString = JSON.stringify(processedItems);
  saveCartToAllStorages(processedItems);
  
  log("Saved to multiple localStorage keys");
  
  // CRITICAL FIX: Added alternative method calls to increase reliability
  // First try to use the global sendCartToCheckout function if available
  if (window.sendCartToCheckout && typeof window.sendCartToCheckout === 'function' && window.sendCartToCheckout !== sendCartToCheckout) {
    log("Using global sendCartToCheckout function");
    window.sendCartToCheckout(processedItems, CONFIG.ORDER_PAYMENT_REDIRECT);
    return;
  }
  
  // Send messages to notify frames/windows that might be listening
  sendCartDataToCheckoutApp(processedItems);
  
  // Process complete checkout flow with API call and redirection
  processCartCheckout(processedItems);
}
