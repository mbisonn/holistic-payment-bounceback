
/**
 * Modified proceedToCheckout function for the landing page
 * Replace the existing proceedToCheckout function in your landing page script
 */

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty');
    return;
  }
  
  // Format cart items in the exact format the checkout app expects
  const cartItems = cart.map(item => ({
    id: item.sku,          // Important: use sku as id
    sku: item.sku,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  
  // Store cart data in all available locations for maximum compatibility
  const cartData = JSON.stringify(cartItems);
  localStorage.setItem('systemeCart', cartData);
  localStorage.setItem('cart', cartData);
  localStorage.setItem('cartItems', cartData);
  localStorage.setItem('teneraCart', cartData);
  localStorage.setItem('pendingOrderData', cartData);
  
  console.log("Cart data saved to all storage locations:", cartItems);
  
  // Define the correct checkout URL for Tenera
  const checkoutUrl = "https://www.teneraholisticandwellness.com/order-payment";
  
  // 1. Try postMessage API first to communicate with the checkout app
  try {
    window.postMessage({
      type: 'CART_DATA',
      cart: cartItems,
      redirectUrl: checkoutUrl
    }, '*');
    
    console.log("Sent cart data via postMessage to checkout app");
  } catch (e) {
    console.error("PostMessage error:", e);
  }
  
  // 2. Always send data to API endpoint for reliability
  fetch(config.dataPostUrl || "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      source: window.location.href
    })
  })
  .then(response => response.json())
  .then(() => {
    console.log("Order data sent to API");
    
    // 3. Redirect with cart data in URL as a guaranteed method
    const encodedCart = encodeURIComponent(JSON.stringify(cartItems));
    const finalCheckoutUrl = `${checkoutUrl}?cart=${encodedCart}&t=${Date.now()}`;
    console.log("Redirecting to:", finalCheckoutUrl);
    window.location.href = finalCheckoutUrl;
  })
  .catch(error => {
    console.error('Error sending order data:', error);
    // Still redirect to checkout with cart data in URL
    const encodedCart = encodeURIComponent(JSON.stringify(cartItems));
    window.location.href = `${checkoutUrl}?cart=${encodedCart}&t=${Date.now()}`;
  });
}

/**
 * Add this to your landing page's <head> section to ensure the integration works:
 *
 * <script>
 * // Create a global event handler to receive cart confirmations
 * window.addEventListener('message', function(event) {
 *   if (event.data && event.data.type === 'CART_RECEIVED') {
 *     console.log("Cart was successfully received by checkout app!");
 *   }
 * });
 * </script>
 */
