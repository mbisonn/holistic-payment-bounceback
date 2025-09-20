/**
 * ENHANCED Systeme.io Integration Script for Tenera Holistic Payment Hub
 * This script provides seamless cart synchronization between Systeme.io and the Lovable payment app
 * Features: SKU-based product matching, multiple sync methods, robust error handling
 */

(function() {
  console.log("🚀 Tenera Enhanced Systeme.io Integration v2.0 initializing...");
  
  // Enhanced Configuration with better error handling and logging
  const config = {
    // IMPORTANT: Update this URL to match your actual Lovable payment app URL
    paymentHubUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com",
    orderFormUrl: "https://www.teneraholisticandwellness.com/order-payment",
    dataPostUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
    cartApiUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/cart",
    currency: "₦",
    debug: true,
    maxRetries: 3,
    retryDelay: 1000,
    
    // Complete product catalog with SKU mapping - CRITICAL for proper sync
    products: {
      "faforon": { sku: "faforon", name: "Faforon", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70fdeb16d_52.png" },
      "becool": { sku: "becool", name: "Becool", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8aea50919_43.png" },
      "dynace-rocenta": { sku: "dynace_rocenta", name: "Dynace Rocenta", price: 30000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b708190650_42.png" },
      "spidex-12": { sku: "spidex_12", name: "Spidex 12", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7105cd6d2_62.png" },
      "salud": { sku: "salud", name: "Salud", price: 20000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b711b93315_82.png" },
      "jigsimur": { sku: "jigsimur", name: "Jigsimur", price: 17500, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8afde7c99_63.png" },
      "jinja": { sku: "jinja", name: "Jinja", price: 17000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70301077f_32.png" },
      "faforditoz": { sku: "faforditoz", name: "Faforditoz", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8af681d36_53.png" },
      "spidex-17": { sku: "spidex_17", name: "Spidex 17", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71440b18d_121.png" },
      "spidex-20": { sku: "spidex_20", name: "Spidex 20", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b65dfab8a5_12.png" },
      "spidex-18": { sku: "spidex_18", name: "Spidex 18", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71529fe6c_131.png" },
      "men-coffee": { sku: "men_coffee", name: "Men Coffee", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b18acad0_83.png" },
      "spidex-21": { sku: "spidex_21", name: "Spidex 21", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7135da5ca_101.png" },
      "spidex-19": { sku: "spidex_19", name: "Spidex 19", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b710f8a766_72.png" },
      "spidex-15": { sku: "spidex_15", name: "Spidex 15", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b66c75de26_22.png" },
      "prosclick": { sku: "prosclick", name: "Prosclick", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b712643cd7_91.png" },
      "green-coffee": { sku: "green_coffee", name: "Green Coffee", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b27469be_92.png" },
      "iru-antiseptic-soap": { sku: "iru_antiseptic_soap", name: "Iru Antiseptic Soap", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b09633de_73.png" },
      "multi-effect-toothpaste": { sku: "multi_effect_toothpaste", name: "Multi Effect Toothpaste", price: 14000, image: "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b338f624_102.png" }
    }
  };

  // Global cart storage
  let globalCart = [];
  
  // Enhanced logging function
  function log(message, data = null) {
    if (config.debug) {
      const timestamp = new Date().toISOString();
      console.log(`🔄 [${timestamp}] TeneraSync:`, message);
      if (data) console.log('📊 Data:', data);
    }
  }

  // Enhanced notification system
  function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `tenera-notification tenera-notification-${type}`;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔄';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
    // Enhanced styling
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '10000',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '350px',
      wordWrap: 'break-word',
      animation: 'slideIn 0.3s ease-out'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // Enhanced cart management with validation
  function addToCart(productId, quantity = 1) {
    log(`Adding product to cart: ${productId} (qty: ${quantity})`);
    
    const product = config.products[productId];
    if (!product) {
      log(`Product not found: ${productId}`, Object.keys(config.products));
      showNotification(`Product "${productId}" not found in catalog`, 'error');
      return false;
    }
    
    const existingIndex = globalCart.findIndex(item => item.sku === product.sku);
    
    if (existingIndex > -1) {
      globalCart[existingIndex].quantity += quantity;
      log(`Updated quantity for ${product.name}: ${globalCart[existingIndex].quantity}`);
    } else {
      const cartItem = {
        id: product.sku,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image || "https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5740b3e4c_17.png",
        category: product.category || 'wellness'
      };
      
      globalCart.push(cartItem);
      log(`Added new item to cart: ${product.name}`);
    }
    
    saveCartToStorage();
    showNotification(`Added ${product.name} to cart`, 'success');
    return true;
  }

  // Enhanced storage management with multiple backup locations
  function saveCartToStorage() {
    const cartData = JSON.stringify(globalCart);
    const storageKeys = ['systemeCart', 'teneraCart', 'cartItems', 'pendingOrderData'];
    
    storageKeys.forEach(key => {
      try {
        localStorage.setItem(key, cartData);
        sessionStorage.setItem(key, cartData);
      } catch (e) {
        log(`Failed to save to ${key}:`, e.message);
      }
    });
    
    log(`Cart saved to storage (${globalCart.length} items)`);
  }

  // Enhanced multi-method sync with retry logic
  async function syncWithPaymentHub(retryCount = 0) {
    if (globalCart.length === 0) {
      showNotification('Cart is empty - nothing to sync', 'error');
      return false;
    }

    log(`Starting sync attempt ${retryCount + 1}/${config.maxRetries}`);
    showNotification('Synchronizing cart data...', 'info');

    try {
      // Method 1: Direct API sync
      await syncViaAPI();
      
      // Method 2: PostMessage sync (for iframes)
      syncViaPostMessage();
      
      // Method 3: URL parameter sync
      syncViaUrlParams();
      
      log('All sync methods completed successfully');
      showNotification('Cart synchronized successfully!', 'success');
      return true;
      
    } catch (error) {
      log(`Sync attempt ${retryCount + 1} failed:`, error.message);
      
      if (retryCount < config.maxRetries - 1) {
        log(`Retrying in ${config.retryDelay}ms...`);
        setTimeout(() => syncWithPaymentHub(retryCount + 1), config.retryDelay);
        return false;
      } else {
        log('All sync attempts failed, proceeding with direct redirect');
        showNotification('Sync failed, redirecting to checkout...', 'error', 2000);
        setTimeout(proceedToCheckout, 2000);
        return false;
      }
    }
  }

  // API-based synchronization
  async function syncViaAPI() {
    log('Attempting API sync...');
    
    const syncPayload = {
      cartItems: globalCart,
      timestamp: new Date().toISOString(),
      source: window.location.href,
      sessionId: generateSessionId()
    };
    
    // Try cart API endpoint
    try {
      const response = await fetch(config.cartApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'systeme-integration'
        },
        body: JSON.stringify(syncPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        log('API sync successful:', result);
        return true;
      } else {
        throw new Error(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      log('API sync failed:', error.message);
      throw error;
    }
  }

  // PostMessage-based synchronization
  function syncViaPostMessage() {
    log('Attempting PostMessage sync...');
    
    const messageData = {
      type: 'CART_DATA',
      cart: globalCart,
      timestamp: new Date().toISOString(),
      source: 'systeme-integration'
    };
    
    try {
      // Send to current window
      window.postMessage(messageData, '*');
      
      // Send to parent window (for iframe scenarios)
      if (window.parent !== window) {
        window.parent.postMessage(messageData, '*');
      }
      
      // Try to find and message any Tenera iframes
      const iframes = document.querySelectorAll('iframe[src*="lovableproject.com"], iframe[src*="teneraholisticandwellness.com"]');
      iframes.forEach(iframe => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(messageData, '*');
          }
        } catch (e) {
          log('Failed to message iframe:', e.message);
        }
      });
      
      log('PostMessage sync completed');
    } catch (error) {
      log('PostMessage sync failed:', error.message);
      throw error;
    }
  }

  // URL parameter-based synchronization
  function syncViaUrlParams() {
    log('Preparing URL parameter sync...');
    
    try {
      const encodedCart = encodeURIComponent(JSON.stringify(globalCart));
      const syncUrl = `${config.paymentHubUrl}?cart=${encodedCart}&t=${Date.now()}`;
      
      // Store the sync URL for the redirect
      sessionStorage.setItem('teneraSyncUrl', syncUrl);
      
      log('URL parameter sync prepared');
    } catch (error) {
      log('URL parameter sync failed:', error.message);
      throw error;
    }
  }

  // Enhanced checkout process
  async function proceedToCheckout() {
    log('Initiating checkout process...');
    
    if (globalCart.length === 0) {
      showNotification('Cannot checkout - cart is empty', 'error');
      return false;
    }
    
    // Save final cart state
    saveCartToStorage();
    
    // Attempt synchronization first
    const syncSuccess = await syncWithPaymentHub();
    
    // Prepare checkout URL
    let checkoutUrl = config.orderFormUrl;
    
    // Add cart data as URL parameters for maximum compatibility
    const cartParam = encodeURIComponent(JSON.stringify(globalCart));
    const orderParam = encodeURIComponent(JSON.stringify({
      items: globalCart,
      totalAmount: globalCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      source: 'systeme-integration',
      synced: syncSuccess
    }));
    
    checkoutUrl += `?cart=${cartParam}&orderData=${orderParam}&synced=${syncSuccess}&t=${Date.now()}`;
    
    log('Redirecting to checkout:', checkoutUrl);
    
    // Brief delay to ensure all sync operations complete
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 1000);
    
    return true;
  }

  // Utility functions
  function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function clearCart() {
    globalCart = [];
    const storageKeys = ['systemeCart', 'teneraCart', 'cartItems', 'pendingOrderData'];
    
    storageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (e) {
        log(`Failed to clear ${key}:`, e.message);
      }
    });
    
    log('Cart cleared');
    showNotification('Cart cleared', 'info');
  }

  // Enhanced message listener for payment completion
  function setupMessageListener() {
    window.addEventListener('message', function(event) {
      if (!event.data || !event.data.type) return;
      
      log('Received message:', event.data);
      
      switch (event.data.type) {
        case 'PAYMENT_SUCCESS':
        case 'ORDER_PROCESSED':
          log('Payment/order completed, clearing cart');
          clearCart();
          showNotification('Payment completed successfully!', 'success');
          break;
          
        case 'CART_RECEIVED':
          log('Payment hub confirmed cart receipt');
          showNotification('Cart data received by payment system', 'success');
          break;
          
        case 'SYNC_ERROR':
          log('Sync error reported:', event.data.error);
          showNotification('Sync error: ' + event.data.error, 'error');
          break;
      }
    });
  }

  // Enhanced initialization
  function initialize() {
    log('Initializing Enhanced Systeme Integration v2.0');
    
    // Set up message listener
    setupMessageListener();
    
    // Try to restore cart from storage
    try {
      const storedCart = localStorage.getItem('systemeCart') || sessionStorage.getItem('systemeCart');
      if (storedCart) {
        globalCart = JSON.parse(storedCart);
        log(`Restored ${globalCart.length} items from storage`);
      }
    } catch (e) {
      log('Failed to restore cart from storage:', e.message);
      globalCart = [];
    }
    
    // Send ready signal to payment hub
    setTimeout(() => {
      window.postMessage({
        type: 'SYSTEME_INTEGRATION_READY',
        version: '2.0',
        cartItems: globalCart.length,
        timestamp: new Date().toISOString()
      }, '*');
    }, 1000);
    
    log('Integration initialized successfully');
  }

  // Global API for external access
  window.teneraCheckout = {
    // Core functions
    addToCart: addToCart,
    proceedToCheckout: proceedToCheckout,
    clearCart: clearCart,
    
    // Cart management
    getCart: () => [...globalCart],
    getCartCount: () => globalCart.reduce((sum, item) => sum + item.quantity, 0),
    getCartTotal: () => globalCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    
    // Sync functions
    syncNow: syncWithPaymentHub,
    
    // Utility functions
    getProducts: () => ({ ...config.products }),
    getConfig: () => ({ ...config }),
    
    // Debug functions
    setDebug: (enabled) => { config.debug = enabled; },
    getLogs: () => console.log('Cart:', globalCart),
    
    // Test function
    test: () => {
      addToCart('blood-booster', 1);
      addToCart('hormone-harmony', 2);
      log('Test items added to cart');
      return globalCart;
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Add CSS for notifications
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .tenera-notification {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `;
  document.head.appendChild(style);

  log('🎉 Tenera Enhanced Systeme Integration v2.0 loaded successfully!');
  
})();
