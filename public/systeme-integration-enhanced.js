/**
 * Enhanced Systeme.io Integration Script for Tenera Holistic Payment Hub
 * This script synchronizes cart data with the Lovable app via SKU matching
 * Updated to work with the latest Lovable app features including order bumps
 */

(function() {
  console.log("Tenera Systeme.io integration (ENHANCED v2.0) initializing...");
  
  // Configuration - Updated with correct endpoints
  const config = {
    lovableAppUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com",
    checkoutUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com/checkout",
    syncCartUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/sync-cart",
    ordersApiUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/orders",
    currency: "₦",
    debug: true,
    
    // Product catalog matching your Lovable app
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

  // Shopping cart
  let cart = [];

  // Debug logging
  function log(...args) {
    if (config.debug) {
      console.log("[TeneraCheckout]:", ...args);
    }
  }

  // Format price in Naira
  function formatPrice(price) {
    return `${config.currency}${price.toLocaleString()}`;
  }

  // Enhanced function to save cart to storage
  function saveCartToStorage() {
    const cartData = JSON.stringify(cart);
    const storageKeys = [
      'systemeCart', 'teneraCart', 'cartItems', 
      'cart', 'pendingOrderData'
    ];
    
    try {
      storageKeys.forEach(key => {
        localStorage.setItem(key, cartData);
        sessionStorage.setItem(key, cartData);
      });
      log('Cart saved to storage:', cart);
    } catch (e) {
      console.warn('Storage not available:', e);
    }
  }

  // Function to add product to cart
  function addToCart(productId, quantity = 1) {
    log(`Adding ${productId} to cart, quantity: ${quantity}`);
    
    const product = config.products[productId];
    if (!product) {
      console.error(`Product ID ${productId} not found in configuration`);
      return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.sku === product.sku);
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.sku,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`Added ${quantity} ${product.name} to cart`);
  }

  // Function to remove item from cart
  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      const removedItem = cart[index];
      cart.splice(index, 1);
      saveCartToStorage();
      updateCartUI();
      showNotification(`Removed ${removedItem.name} from cart`);
    }
  }

  // Function to update cart UI
  function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartContainer || !cartTotal) return;
    
    cartContainer.innerHTML = '';
    
    let total = 0;
    let count = 0;
    
    if (cart.length === 0) {
      cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        count += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">${formatPrice(item.price)} × ${item.quantity}</div>
          </div>
          <div class="item-total">${formatPrice(itemTotal)}</div>
          <button class="remove-item" onclick="removeFromCart(${index})">×</button>
        `;
        cartContainer.appendChild(cartItem);
      });
    }
    
    cartTotal.textContent = formatPrice(total);
    if (cartCount) cartCount.textContent = count;
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
    }
  }

  // Function to show notification
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'tenera-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${isError ? '#e74c3c' : '#27ae60'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      transition: all 0.3s ease;
      transform: translateX(100%);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px; font-size: 18px;">${isError ? '⚠️' : '✅'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Enhanced checkout function with better integration
  async function proceedToCheckout() {
    if (cart.length === 0) {
      showNotification('Your cart is empty', true);
      return;
    }
    
    showNotification('Preparing checkout...');
    
    // Format cart items for the Lovable app
    const cartItems = cart.map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Prepare comprehensive sync data
    const syncData = {
      cartItems: cartItems,
      customerInfo: {
        name: '',
        email: '',
        phone: ''
      },
      totalAmount: totalAmount,
      timestamp: new Date().toISOString(),
      source: 'systeme_io_enhanced'
    };
    
    log("Syncing cart with Lovable app:", syncData);
    saveCartToStorage();

    // Send to Lovable app via multiple channels
    try {
      // Method 1: PostMessage API
      const messageData = {
        type: 'CHECKOUT_INITIATED',
        cartItems: cartItems,
        orderData: {
          items: cartItems,
          totalAmount: totalAmount,
          timestamp: new Date().toISOString(),
          source: 'systeme_io_enhanced'
        }
      };

      window.postMessage(messageData, '*');
      if (window.parent !== window) {
        window.parent.postMessage(messageData, '*');
      }

      // Method 2: Try to sync with API
      fetch(config.syncCartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(syncData)
      }).then(response => {
        if (response.ok) {
          log("Cart sync successful");
        }
      }).catch(error => {
        log("Cart sync failed:", error);
      });

      showNotification('Cart synchronized! Redirecting...');
      
      // Redirect to checkout page
      setTimeout(() => {
        window.location.href = config.checkoutUrl;
      }, 1500);
      
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Checkout error. Trying direct redirect...', true);
      
      // Fallback: Direct redirect with URL parameters
      const encodedCart = encodeURIComponent(JSON.stringify(cartItems));
      window.location.href = `${config.checkoutUrl}?cart=${encodedCart}&t=${Date.now()}`;
    }
  }

  // Enhanced message listener
  function setupMessageChannel() {
    window.addEventListener('message', function(event) {
      log('Received message:', event.data);
      
      if (!event.data || !event.data.type) return;
      
      switch (event.data.type) {
        case 'CART_READY':
          log('Lovable app is ready for cart data');
          if (cart.length > 0) {
            window.postMessage({
              type: 'CART_DATA',
              cartItems: cart,
              timestamp: new Date().toISOString()
            }, '*');
          }
          break;
          
        case 'CART_RECEIVED':
          log('Cart data received by Lovable app');
          showNotification('Cart synchronized successfully!');
          break;
          
        case 'ORDER_PROCESSED':
        case 'PAYMENT_SUCCESS':
          clearAllCartData();
          updateCartUI();
          showNotification('Order processed successfully!');
          break;
      }
    });
  }

  // Clear all cart data
  function clearAllCartData() {
    cart = [];
    const storageKeys = [
      'systemeCart', 'teneraCart', 'cartItems', 
      'cart', 'pendingOrderData'
    ];
    
    storageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to clear ${key}:`, e);
      }
    });
    
    log('All cart data cleared');
  }

  // Create enhanced cart UI
  function createCartUI() {
    if (document.getElementById('tenera-shopping-cart')) return;
    
    const cartUI = document.createElement('div');
    cartUI.id = 'tenera-shopping-cart';
    cartUI.innerHTML = `
      <div class="cart-header">
        <h3>🛒 Cart <span id="cart-count" class="cart-count">0</span></h3>
        <button class="toggle-cart" onclick="toggleCart()">▼</button>
      </div>
      <div class="cart-body">
        <div id="cart-items"></div>
        <div class="cart-footer">
          <div class="cart-total-row">
            <strong>Total: <span id="cart-total">${config.currency}0</span></strong>
          </div>
          <button id="checkout-btn" onclick="proceedToCheckout()">
            🚀 Proceed to Checkout
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(cartUI);
    
    // Add enhanced styles
    if (!document.getElementById('tenera-cart-styles')) {
      const styles = document.createElement('style');
      styles.id = 'tenera-cart-styles';
      styles.textContent = `
        #tenera-shopping-cart {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          z-index: 9999;
          overflow: hidden;
          border: 2px solid #27ae60;
          font-family: Arial, sans-serif;
        }
        
        @media (max-width: 768px) {
          #tenera-shopping-cart {
            width: calc(100% - 20px);
            right: 10px;
            left: 10px;
            max-width: 350px;
            margin: 0 auto;
          }
        }
        
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
        }
        
        .cart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .cart-count {
          display: inline-block;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          text-align: center;
          line-height: 24px;
          font-size: 12px;
          margin-left: 8px;
        }
        
        .toggle-cart {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .toggle-cart:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .cart-body {
          max-height: 400px;
          overflow-y: auto;
        }
        
        #cart-items {
          padding: 15px 20px;
        }
        
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .cart-item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-name {
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        
        .item-price {
          font-size: 12px;
          color: #7f8c8d;
        }
        
        .item-total {
          font-weight: bold;
          color: #27ae60;
          margin: 0 10px;
        }
        
        .remove-item {
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .remove-item:hover {
          background: #c0392b;
        }
        
        .empty-cart {
          text-align: center;
          color: #95a5a6;
          padding: 30px 0;
          font-style: italic;
        }
        
        .cart-footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        
        .cart-total-row {
          text-align: center;
          margin-bottom: 15px;
          font-size: 16px;
          color: #2c3e50;
        }
        
        #checkout-btn {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        #checkout-btn:hover {
          background: linear-gradient(135deg, #229954, #27ae60);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }
        
        #checkout-btn:active {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(styles);
    }
  }

  // Toggle cart visibility
  function toggleCart() {
    const cartElement = document.getElementById('tenera-shopping-cart');
    const cartBody = cartElement.querySelector('.cart-body');
    const toggleBtn = cartElement.querySelector('.toggle-cart');
    
    if (cartBody.style.display === 'none') {
      cartBody.style.display = 'block';
      toggleBtn.textContent = '▼';
    } else {
      cartBody.style.display = 'none';
      toggleBtn.textContent = '▲';
    }
  }

  // Initialize everything
  function initialize() {
    log('Initializing enhanced Tenera integration...');
    
    // Restore cart from storage
    try {
      const savedCart = localStorage.getItem('systemeCart') || sessionStorage.getItem('systemeCart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
        log('Cart restored from storage:', cart);
      }
    } catch (e) {
      cart = [];
      log('Starting with empty cart');
    }
    
    createCartUI();
    updateCartUI();
    setupMessageChannel();
    
    // Auto-detect and bind to existing buttons
    setTimeout(() => {
      const buyButtons = document.querySelectorAll('[data-product], .add-to-cart, .buy-button');
      buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          const productId = this.getAttribute('data-product') || 
                           this.getAttribute('data-sku') ||
                           this.closest('[data-product]')?.getAttribute('data-product');
          
          if (productId && config.products[productId]) {
            e.preventDefault();
            const quantityInput = document.querySelector(`input[data-quantity="${productId}"], .quantity-input`);
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            addToCart(productId, quantity);
          }
        });
      });
      
      log(`Auto-bound to ${buyButtons.length} product buttons`);
    }, 1000);
    
    // Send ready signal
    setTimeout(() => {
      window.postMessage({
        type: 'CART_SYSTEM_READY',
        cartItemCount: cart.length,
        timestamp: new Date().toISOString()
      }, '*');
      log('Sent ready signal');
    }, 2000);
  }

  // Global API
  window.teneraCheckout = {
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    proceedToCheckout: proceedToCheckout,
    clearCart: clearAllCartData,
    getCart: () => cart,
    getCartData: () => {
      try {
        return JSON.parse(localStorage.getItem('systemeCart') || '[]');
      } catch (e) {
        return cart;
      }
    },
    toggleCart: toggleCart,
    config: config
  };

  // Export individual functions
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.proceedToCheckout = proceedToCheckout;
  window.toggleCart = toggleCart;
  window.clearAllCartData = clearAllCartData;

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  log("Enhanced Tenera-Lovable integration v2.0 loaded successfully!");
})();
