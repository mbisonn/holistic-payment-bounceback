
/**
 * Main entry point for the cart system
 */

import { 
  sendCartToCheckout, 
  getCartData, 
  clearCart, 
  initializeCartIntegration,
  diagnoseCommunication
} from './cart/index.js';
import { CONFIG } from './config.js';

// Make functions globally available
window.sendCartToCheckout = sendCartToCheckout;
window.getCartData = getCartData;
window.clearCart = clearCart;
window.CONFIG = CONFIG;
window.diagnoseCommunication = diagnoseCommunication;

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Tenera cart system initialized');
  
  // Initialize cart integration with checkout system
  initializeCartIntegration();
  
  // Run diagnostics after a delay to help with debugging
  setTimeout(() => {
    if (CONFIG.DEBUG) {
      diagnoseCommunication();
    }
  }, 2000);
  
  // CRITICAL FIX: Check URL parameters for cart data immediately
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('cart')) {
    try {
      console.log("Found cart data in URL parameters");
      const cartData = JSON.parse(decodeURIComponent(urlParams.get('cart')));
      if (Array.isArray(cartData) && cartData.length > 0) {
        console.log("Processing cart data from URL", cartData);
        window.sendCartToCheckout(cartData);
      }
    } catch (e) {
      console.error("Error processing cart data from URL:", e);
    }
  }
});

// Set up an event listener for the "checkout" button click
document.addEventListener('click', function(event) {
  if (event.target && 
      (event.target.id === 'checkout-btn' || 
       event.target.className?.includes('checkout-btn') || 
       event.target.dataset?.action === 'checkout')) {
    
    console.log("Checkout button clicked, processing order...");
    
    // Get current cart data
    const cartData = getCartData();
    if (Array.isArray(cartData) && cartData.length > 0) {
      // Prevent default action if this is a link
      event.preventDefault();
      
      // Process checkout using the updated function
      proceedToCheckout(cartData);
    }
  }
});

// Updated proceedToCheckout function from landingPage-updated.html
function proceedToCheckout(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    console.log('Cart is empty');
    return;
  }
  
  // Format cart items in the exact format the checkout app expects
  const formattedCartItems = cartItems.map(item => ({
    id: item.sku || item.id,          // Important: use sku as id
    sku: item.sku || item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  
  // Store cart data in all available locations for maximum compatibility
  const cartData = JSON.stringify(formattedCartItems);
  localStorage.setItem('systemeCart', cartData);
  localStorage.setItem('cart', cartData);
  localStorage.setItem('cartItems', cartData);
  localStorage.setItem('teneraCart', cartData);
  localStorage.setItem('pendingOrderData', cartData);
  
  console.log("Cart data saved to all storage locations:", formattedCartItems);
  
  // Define the correct checkout URL
  const checkoutUrl = CONFIG.ORDER_PAYMENT_REDIRECT;
  
  // Try to use the Tenera integration if it's available
  if (window.teneraIntegration && typeof window.teneraIntegration.sendCartToCheckout === 'function') {
    console.log("Using teneraIntegration.sendCartToCheckout");
    window.teneraIntegration.sendCartToCheckout(formattedCartItems);
    return;
  }
  
  // Send order data to API then redirect
  fetch(CONFIG.ORDERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: formattedCartItems,
      totalAmount: formattedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      source: window.location.href
    })
  })
  .then(response => response.json())
  .then(() => {
    // Add cart data to URL as a fallback mechanism
    const encodedCart = encodeURIComponent(JSON.stringify(formattedCartItems));
    window.location.href = `${checkoutUrl}?cart=${encodedCart}&t=${Date.now()}`;
  })
  .catch(error => {
    console.error('Error sending order data:', error);
    // Still redirect to checkout with cart data in URL
    const encodedCart = encodeURIComponent(JSON.stringify(formattedCartItems));
    window.location.href = `${checkoutUrl}?cart=${encodedCart}&t=${Date.now()}`;
  });
}

// Add special handler for messages from parent windows (for iframe integration)
window.addEventListener('message', function(event) {
  // Safely check the event data
  if (!event.data || typeof event.data !== 'object') return;
  
  console.log("Received message in main.js:", event.data.type);
  
  // Handle cart data message
  if (event.data.type === 'CART_DATA' && Array.isArray(event.data.cart)) {
    console.log("Received CART_DATA message with", event.data.cart.length, "items");
    
    // Enhanced error handling and validation
    try {
      // Format cart items to ensure consistent structure
      const normalizedItems = event.data.cart.map(item => ({
        id: item.sku || item.id || '',
        sku: item.sku || item.id || '',
        name: item.name || 'Unknown Product',
        price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
        quantity: item.quantity ? parseInt(item.quantity) : 1,
        image: item.image || '/placeholder.svg'
      }));
      
      // Save to all storage locations for maximum compatibility
      const cartData = JSON.stringify(normalizedItems);
      localStorage.setItem('systemeCart', cartData);
      localStorage.setItem('cart', cartData);
      localStorage.setItem('cartItems', cartData);
      localStorage.setItem('teneraCart', cartData);
      localStorage.setItem('pendingOrderData', cartData);
      
      // Send to checkout system
      sendCartToCheckout(normalizedItems);
      
      // Send confirmation back
      try {
        window.parent.postMessage({
          type: 'CART_RECEIVED',
          success: true,
          timestamp: new Date().toISOString(),
          cartCount: normalizedItems.length
        }, '*');
      } catch (e) {
        console.error("Error sending confirmation:", e);
      }
    } catch (e) {
      console.error("Error processing CART_DATA message:", e);
    }
  }
  
  // Handle alternative cart message format
  if (event.data.type === 'ADD_TO_CART' && Array.isArray(event.data.payload)) {
    console.log("Received ADD_TO_CART message with", event.data.payload.length, "items");
    try {
      const normalizedItems = event.data.payload.map(item => ({
        id: item.sku || item.id || '',
        sku: item.sku || item.id || '',
        name: item.name || 'Unknown Product',
        price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
        quantity: item.quantity ? parseInt(item.quantity) : 1,
        image: item.image || '/placeholder.svg'
      }));
      
      // Save to local storage
      const cartData = JSON.stringify(normalizedItems);
      localStorage.setItem('systemeCart', cartData);
      localStorage.setItem('cart', cartData);
      localStorage.setItem('cartItems', cartData);
      localStorage.setItem('teneraCart', cartData);
      localStorage.setItem('pendingOrderData', cartData);
      
      sendCartToCheckout(normalizedItems);
    } catch (e) {
      console.error("Error processing ADD_TO_CART message:", e);
    }
  }
});
