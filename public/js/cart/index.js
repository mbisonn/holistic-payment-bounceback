
/**
 * Cart module index
 * Re-exports functionality from individual modules
 */

import { sendCartToCheckout } from './checkout.js';
import { getCartData, clearCart, saveCartToAllStorages } from './storage.js';
import { CONFIG } from '../config.js';
import { initializeCartIntegration, sendCartDataToCheckoutApp, processCartCheckout } from './integration.js';

// Diagnostic debug function to help troubleshoot integration issues
const diagnoseCommunication = () => {
  console.log("Diagnosing communication channels:");
  console.log("- Current URL:", window.location.href);
  console.log("- In iframe:", window !== window.parent);
  console.log("- Local storage items:", Object.keys(localStorage));
  
  // Check if cart data exists in any storage key
  const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
  storageKeys.forEach(key => {
    const data = localStorage.getItem(key);
    console.log(`- ${key}: ${data ? 'exists with ' + data.length + ' chars' : 'empty'}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`  - Contains ${Array.isArray(parsed) ? parsed.length : 0} items`);
      } catch (e) {
        console.log("  - Invalid JSON");
      }
    }
  });
  
  // Check available frames
  const iframes = document.querySelectorAll('iframe');
  console.log("- Found iframes:", iframes.length);
  iframes.forEach((iframe, index) => {
    console.log(`  - Iframe #${index}: ${iframe.src}`);
  });
  
  console.log("- Communication config:", CONFIG.ALLOWED_ORIGINS);
  
  // Try sending a test message
  try {
    window.postMessage({ type: 'DIAGNOSTIC_TEST', timestamp: new Date().toISOString() }, '*');
    console.log("- Test message sent to self");
    
    if (window !== window.parent) {
      window.parent.postMessage({ type: 'DIAGNOSTIC_TEST', timestamp: new Date().toISOString() }, '*');
      console.log("- Test message sent to parent");
    }
  } catch (e) {
    console.error("- Error sending test message:", e);
  }
};

// Export all functionality
export {
  sendCartToCheckout,
  getCartData,
  clearCart,
  saveCartToAllStorages,
  initializeCartIntegration,
  sendCartDataToCheckoutApp,
  processCartCheckout,
  CONFIG,
  diagnoseCommunication
};
