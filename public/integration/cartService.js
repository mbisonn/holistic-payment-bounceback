
import { CONFIG } from './config.js';
import { log, saveToMultipleStorages } from './utils.js';

/**
 * Format and standardize cart items
 */
export function formatCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    log("Warning: Cart items is not an array");
    return [];
  }
  
  // CRITICAL FIX: Enhanced SKU normalization to ensure matching
  return cartItems.map(item => {
    const sku = item.sku || item.id || 'unknown';
    // Normalize SKU by removing dashes and converting to lowercase
    const normalizedSku = typeof sku === 'string' ? 
      sku.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '') : sku;
      
    return {
      id: normalizedSku,
      sku: normalizedSku,
      name: item.name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
    };
  });
}

/**
 * Send cart data to API
 */
export async function sendCartDataToApi(cartItems) {
  log("Sending cart data to API:", cartItems);
  
  const formattedItems = formatCartItems(cartItems);
  
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: formattedItems,
        source: document.referrer || window.location.href,
        timestamp: new Date().toISOString(),
        redirectUrl: CONFIG.ORDER_PAYMENT_URL
      })
    });
    
    const data = await response.json();
    log("API response:", data);
    return data;
  } catch (error) {
    log("Fetch error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Process cart data and redirect to checkout
 */
export function proceedToCheckout() {
  const cartData = loadAndValidateCart();
  
  if (!cartData) {
    log("No valid cart data found, redirecting anyway");
    window.location.href = CONFIG.ORDER_PAYMENT_URL;
    return;
  }
  
  // Send cart data to API then redirect
  sendCartDataToApi(cartData)
    .finally(() => {
      // CRITICAL FIX: Add timestamp to URL to prevent cache issues
      const redirectUrl = new URL(CONFIG.ORDER_PAYMENT_URL);
      redirectUrl.searchParams.set('t', Date.now().toString());
      redirectUrl.searchParams.set('cart', JSON.stringify(cartData));
      window.location.href = redirectUrl.toString();
    });
}

/**
 * Load cart data from storage and validate it
 */
function loadAndValidateCart() {
  const cartRaw = getCartData();
  
  if (!cartRaw || !Array.isArray(cartRaw) || cartRaw.length === 0) {
    log("Invalid cart data format or empty cart");
    return null;
  }
  
  // Format and standardize cart items
  const formattedItems = formatCartItems(cartRaw);
  
  // Save the standardized format back to storage
  saveToMultipleStorages(formattedItems);
  
  return formattedItems;
}

/**
 * Get cart data from all possible storage locations
 */
export function getCartData() {
  try {
    // Try primary storage first
    let cartData = localStorage.getItem(CONFIG.STORAGE_KEYS.PRIMARY);
    
    // If not found, try secondary storage locations
    if (!cartData) {
      for (const key of CONFIG.STORAGE_KEYS.SECONDARY) {
        const data = localStorage.getItem(key);
        if (data) {
          cartData = data;
          break;
        }
      }
    }
    
    return cartData ? JSON.parse(cartData) : [];
  } catch (e) {
    log("Error getting cart data:", e);
    return [];
  }
}
