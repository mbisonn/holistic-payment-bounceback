
/**
 * Cart service functionality for the checkout system
 */

import { saveToStorage, getCartFromStorage } from './storage.js';
import { CONFIG } from './config.js';

/**
 * Send cart data to checkout and handle the redirect process
 * @param {Array} cart - Array of cart items 
 * @param {string} redirectUrl - URL to redirect to after checkout processing
 */
export function sendCartToCheckout(cart, redirectUrl) {
  try {
    // Log the beginning of the checkout process
    console.log('Starting checkout process with cart data:', cart);
    
    // Ensure cart is properly formatted
    const formattedCart = Array.isArray(cart) ? cart : [];
    
    // Store cart data in storage
    saveToStorage(formattedCart);
    
    // Use postMessage to send cart data to the checkout app
    try {
      console.log('Attempting to use postMessage API to send cart data');
      
      const cartMessage = {
        type: 'CART_DATA',
        cart: formattedCart,
        redirectUrl: redirectUrl, // Pass the redirect URL in the message
        timestamp: new Date().toISOString()
      };
      
      // Send to current window (useful when checkout app is loaded in same window)
      window.postMessage(cartMessage, '*');
      console.log('Sent cart data to current window');
      
      // Send to parent window (useful when checkout app is in parent frame)
      if (window !== window.parent) {
        window.parent.postMessage(cartMessage, '*');
        console.log('Sent cart data to parent window');
      }
      
      // Try sending with alternative message format
      window.postMessage({
        type: 'ADD_TO_CART',
        payload: formattedCart,
        redirectUrl: redirectUrl,
        timestamp: new Date().toISOString()
      }, '*');
      
      console.log('Sent alternative format cart data');
      
      // Wait briefly for messages to be processed before redirecting
      setTimeout(() => {
        proceedWithRedirect(formattedCart, redirectUrl);
      }, 500);
    } catch (e) {
      console.error('Error with postMessage:', e);
      proceedWithRedirect(formattedCart, redirectUrl);
    }
  } catch (e) {
    console.error('Error in checkout process:', e);
    // Fallback to basic redirect
    window.location.href = redirectUrl || CONFIG.DEFAULT_CHECKOUT_URL;
  }
}

/**
 * Handle the redirect process for checkout
 * @param {Array} formattedCart - The formatted cart data
 * @param {string} redirectUrl - The URL to redirect to
 */
function proceedWithRedirect(formattedCart, redirectUrl) {
  // Use the provided redirect URL, or default to the app's URL
  const checkoutUrl = redirectUrl || CONFIG.DEFAULT_CHECKOUT_URL;
  
  // Add cart data to URL as a guaranteed fallback
  const urlWithCart = new URL(checkoutUrl);
  
  // Add cart data to URL - encode it to ensure it's properly transmitted
  try {
    const encodedCartData = encodeURIComponent(JSON.stringify(formattedCart));
    urlWithCart.searchParams.set('cart', encodedCartData);
    
    // Add timestamp to bust cache
    urlWithCart.searchParams.set('t', new Date().getTime().toString());
    
    // Add a flag to indicate this request should redirect after processing
    if (redirectUrl && redirectUrl !== CONFIG.DEFAULT_CHECKOUT_URL) {
      urlWithCart.searchParams.set('redirect', 'true');
      urlWithCart.searchParams.set('redirectUrl', redirectUrl);
    }
  } catch (e) {
    console.error('Error encoding cart data for URL:', e);
  }
  
  console.log('Redirecting to:', urlWithCart.toString());
  window.location.href = urlWithCart.toString();
}
