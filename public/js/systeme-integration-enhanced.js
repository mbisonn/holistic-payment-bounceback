// Configuration
const CONFIG = {
  CHECKOUT_URL: 'https://www.teneraholisticandwellness.com/order-payment',
  UPSELL_URL: 'https://www.teneraholisticandwellness.com/upsell',
  THANKYOU_URL: 'https://www.teneraholisticandwellness.com/thankyoupage',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_SUBACCOUNT: process.env.PAYSTACK_SUBACCOUNT,
  STORAGE_KEYS: {
    PRIMARY: 'systemeCart',
    SECONDARY: ['cart', 'cartItems', 'teneraCart', 'pendingOrderData']
  },
  SECURITY: {
    MAX_RETRIES: 3,
    TIMEOUT: 5000,
    VALIDATION_REGEX: /^[a-zA-Z0-9\s\-_.,]+$/
  }
};

// Debug logging with sanitization
function log(...args) {
  if (CONFIG.DEBUG) {
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return arg.replace(/[<>]/g, '');
      }
      return arg;
    });
    console.log('🔄 [SystemeIntegration]:', ...sanitizedArgs);
  }
}

// Input validation
function validateInput(input) {
  if (!input || typeof input !== 'string') return false;
  return CONFIG.SECURITY.VALIDATION_REGEX.test(input);
}

// Save cart data to multiple storage locations with encryption
async function saveCartToStorage(cartItems) {
  try {
    const cartString = JSON.stringify(cartItems);
    
    // Validate cart data
    if (!Array.isArray(cartItems)) {
      throw new Error('Invalid cart data format');
    }
    
    // Save to all storage locations using secure storage
    for (const key of Object.values(CONFIG.STORAGE_KEYS).flat()) {
      await secureStorage.setItem(key, cartString);
    }
    
    // Also save to sessionStorage for cross-page consistency
    await secureStorage.setItem('teneraCartData', cartString);
    
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartDataUpdated', { 
      detail: cartItems,
      bubbles: true,
      composed: true
    }));
    
    log('Cart data saved to all storage locations');
  } catch (error) {
    console.error('Error saving cart data:', error);
    throw error;
  }
}

// Handle checkout button click with security measures
async function handleCheckoutClick(event) {
  event.preventDefault();
  log('Checkout button clicked');
  
  try {
    // Get cart data from secure storage
    const cartData = await secureStorage.getItem(CONFIG.STORAGE_KEYS.PRIMARY);
    if (!cartData) {
      log('No cart data found');
      window.location.href = CONFIG.CHECKOUT_URL;
      return;
    }
    
    // Parse and validate cart data
    const cartItems = JSON.parse(cartData);
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      log('Invalid cart data');
      window.location.href = CONFIG.CHECKOUT_URL;
      return;
    }
    
    // Validate each item in cart
    for (const item of cartItems) {
      if (!validateInput(item.name) || !validateInput(item.price)) {
        throw new Error('Invalid cart item data');
      }
    }
    
    // Save cart data to all storage locations
    await saveCartToStorage(cartItems);
    
    // Redirect to checkout page
    window.location.href = CONFIG.CHECKOUT_URL;
  } catch (error) {
    console.error('Error handling checkout:', error);
    window.location.href = CONFIG.CHECKOUT_URL;
  }
}

// Initialize Paystack payment with security measures
function initializePaystackPayment(amount, email, reference, metadata = {}) {
  // Validate inputs
  if (!validateInput(email) || !validateInput(reference)) {
    throw new Error('Invalid payment parameters');
  }
  
  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100, // Convert to kobo
    currency: 'NGN',
    ref: reference,
    subaccount: process.env.PAYSTACK_SUBACCOUNT,
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: 'Payment For',
          variable_name: 'payment_for',
          value: metadata.productName || 'Product'
        }
      ]
    },
    callback: function(response) {
      // Validate response
      if (!response || !response.reference) {
        throw new Error('Invalid payment response');
      }
      
      // Handle successful payment
      const redirectUrl = metadata.isUpsell ? CONFIG.UPSELL_URL : CONFIG.THANKYOU_URL;
      window.location.href = redirectUrl;
    },
    onClose: function() {
      // Handle payment modal close
      log('Payment cancelled');
    }
  });
  
  handler.openIframe();
}

// Attach event listeners with security measures
document.addEventListener('DOMContentLoaded', function() {
  // Find all checkout buttons
  const checkoutButtons = document.querySelectorAll('[data-checkout-button]');
  checkoutButtons.forEach(button => {
    // Add click event listener with debounce
    let lastClick = 0;
    button.addEventListener('click', function(event) {
      const now = Date.now();
      if (now - lastClick < CONFIG.SECURITY.TIMEOUT) {
        event.preventDefault();
        return;
      }
      lastClick = now;
      handleCheckoutClick(event);
    });
  });
  
  // Listen for cart data updates
  window.addEventListener('cartDataUpdated', function(event) {
    if (event.detail) {
      log('Cart data updated:', event.detail);
    }
  });
  
  // Initialize Paystack
  if (typeof PaystackPop !== 'undefined') {
    log('Paystack initialized');
  } else {
    console.error('Paystack not loaded');
  }
}); 