
/**
 * Enhanced TeneraShoppingCart Integration Script
 * For seamless cart synchronization with Lovable payment hub
 */

console.log("🚀 Enhanced TeneraShoppingCart Integration v3.0 Loading...");

class EnhancedTeneraIntegration {
  constructor() {
    this.paymentHubUrl = 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com';
    this.isReady = false;
    this.cartData = [];
    this.retryCount = 0;
    this.maxRetries = 10;
    
    console.log("🔧 TeneraIntegration initialized");
    this.init();
  }

  init() {
    // Multiple initialization strategies
    this.setupEventListeners();
    this.setupDOMObserver();
    this.detectExistingCart();
    this.startPeriodicCheck();
    
    // Ready signal
    setTimeout(() => {
      this.isReady = true;
      this.announceReady();
      console.log("✅ TeneraIntegration ready");
    }, 1000);
  }

  setupEventListeners() {
    // Listen for cart updates from TeneraShoppingCart
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'CART_READY') {
        console.log("📥 Payment hub is ready, sending cart data");
        this.sendCartToHub();
      }
    });

    // Custom event listeners for cart updates
    document.addEventListener('cartUpdated', (event) => {
      console.log("🛒 Cart updated event detected:", event.detail);
      this.cartData = event.detail || [];
      this.sendCartToHub();
    });

    // Storage event listener
    window.addEventListener('storage', (event) => {
      if (['teneraCart', 'cartItems', 'systemeCart'].includes(event.key)) {
        console.log(`📦 Storage updated: ${event.key}`);
        this.detectExistingCart();
      }
    });
  }

  setupDOMObserver() {
    // Observe DOM changes to detect cart button clicks
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            this.scanForCartElements(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan
    this.scanForCartElements(document.body);
  }

  scanForCartElements(element) {
    // Look for checkout buttons with various selectors
    const checkoutSelectors = [
      '[data-checkout]',
      '.checkout-btn',
      '.proceed-checkout',
      '.payment-btn',
      'button[onclick*="checkout"]',
      'a[href*="checkout"]',
      '.tenera-checkout'
    ];

    checkoutSelectors.forEach(selector => {
      const buttons = element.querySelectorAll ? element.querySelectorAll(selector) : [];
      buttons.forEach(button => {
        if (!button.hasAttribute('data-tenera-enhanced')) {
          this.enhanceCheckoutButton(button);
          button.setAttribute('data-tenera-enhanced', 'true');
        }
      });
    });
  }

  enhanceCheckoutButton(button) {
    console.log("🔧 Enhancing checkout button:", button);
    
    const originalHandler = button.onclick;
    
    button.onclick = (e) => {
      console.log("🛒 Checkout button clicked");
      
      // Get cart data before proceeding
      this.detectExistingCart();
      
      if (this.cartData.length > 0) {
        e.preventDefault();
        this.proceedToPaymentHub();
      } else {
        // Try original handler or proceed normally
        if (originalHandler) {
          originalHandler.call(button, e);
        }
      }
    };

    // Also add click event listener (backup)
    button.addEventListener('click', (e) => {
      setTimeout(() => {
        this.detectExistingCart();
        if (this.cartData.length > 0) {
          this.proceedToPaymentHub();
        }
      }, 100);
    });
  }

  detectExistingCart() {
    console.log("🔍 Detecting existing cart data...");
    
    // Check multiple storage locations
    const storageKeys = [
      'teneraCart',
      'teneraCheckoutData', 
      'cartItems',
      'systemeCart',
      'pendingOrderData'
    ];

    let foundCart = null;

    for (const key of storageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            foundCart = parsed;
            console.log(`✅ Found cart in ${key}:`, foundCart);
            break;
          } else if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
            foundCart = parsed.items;
            console.log(`✅ Found cart items in ${key}:`, foundCart);
            break;
          }
        }
      } catch (e) {
        console.error(`❌ Error parsing ${key}:`, e);
      }
    }

    // Try to get cart from global variables
    if (!foundCart) {
      const globalVars = ['teneraCart', 'cartData', 'shoppingCart', 'cart'];
      for (const varName of globalVars) {
        if (window[varName] && Array.isArray(window[varName]) && window[varName].length > 0) {
          foundCart = window[varName];
          console.log(`✅ Found cart in global ${varName}:`, foundCart);
          break;
        }
      }
    }

    if (foundCart) {
      this.cartData = foundCart;
      console.log("🎯 Cart data updated:", this.cartData);
      return true;
    } else {
      console.log("❌ No cart data found");
      return false;
    }
  }

  sendCartToHub() {
    if (!this.cartData || this.cartData.length === 0) {
      console.log("⚠️ No cart data to send");
      return;
    }

    console.log("📤 Sending cart data to payment hub:", this.cartData);

    // Send via postMessage
    const message = {
      type: 'CART_DATA',
      items: this.cartData,
      timestamp: new Date().toISOString(),
      source: 'tenera-website'
    };

    // Try sending to payment hub window
    try {
      window.postMessage(message, '*');
      
      // Also try to find payment hub iframe
      const iframe = document.querySelector('iframe[src*="lovableproject.com"]');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*');
      }
    } catch (e) {
      console.error("❌ Error sending message:", e);
    }

    // Store in multiple locations for pickup
    try {
      localStorage.setItem('teneraCart', JSON.stringify(this.cartData));
      localStorage.setItem('cartItems', JSON.stringify(this.cartData));
      localStorage.setItem('pendingOrderData', JSON.stringify(this.cartData));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'teneraCart',
        newValue: JSON.stringify(this.cartData),
        storageArea: localStorage
      }));
    } catch (e) {
      console.error("❌ Error storing cart data:", e);
    }
  }

  proceedToPaymentHub() {
    console.log("🚀 Proceeding to payment hub with cart:", this.cartData);
    
    // Store cart data before navigation
    this.sendCartToHub();
    
    // Navigate to payment hub
    setTimeout(() => {
      window.open(this.paymentHubUrl, '_blank');
    }, 500);
  }

  startPeriodicCheck() {
    // Check for cart updates every 2 seconds
    setInterval(() => {
      if (this.detectExistingCart()) {
        this.sendCartToHub();
      }
    }, 2000);
  }

  announceReady() {
    // Send ready signal
    window.postMessage({
      type: 'TENERA_INTEGRATION_READY',
      timestamp: new Date().toISOString()
    }, '*');

    console.log("📢 TeneraIntegration announced ready");
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EnhancedTeneraIntegration();
  });
} else {
  new EnhancedTeneraIntegration();
}

// Global access
window.TeneraIntegration = EnhancedTeneraIntegration;

console.log("✅ Enhanced TeneraShoppingCart Integration loaded successfully");
