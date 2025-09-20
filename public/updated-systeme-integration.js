
/**
 * Updated Systeme.io Integration Script for Tenera Holistic Payment Hub
 * This script synchronizes cart data with the Lovable app via SKU matching
 */

(function() {
  console.log("Tenera Systeme.io integration (UPDATED) initializing...");
  
  // Configuration - Updated with correct Lovable app URLs
  const config = {
    orderFormUrl: "https://www.teneraholisticandwellness.com/order-payment",
    lovableAppUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com", // Updated to correct Lovable app URL
    syncCartUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/sync-cart", // Correct sync endpoint
    ordersApiUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/orders", // Orders API endpoint
    currency: "₦", // Nigerian Naira symbol
    debug: true,  // Set to true for console debugging
    products: {
      "blood-booster": { 
        sku: "blood_booster",
        name: "Blood Booster", 
        price: 25000,
        defaultQuantity: 1
      },
      "immuno-guard-plus": { 
        sku: "immuno_guard_plus",
        name: "Immuno Guard Plus", 
        price: 25000,
        defaultQuantity: 1
      },
      "vein-thrombus": { 
        sku: "vein_thrombus",
        name: "Vein Thrombus", 
        price: 25000,
        defaultQuantity: 1
      },
      "cardio-tincture": {
        sku: "cardio_tincture",
        name: "Cardio Tincture", 
        price: 10000,
        defaultQuantity: 1
      },
      "cardio-sure": { 
        sku: "cardio_sure", 
        name: "Cardio Sure", 
        price: 25000,
        defaultQuantity: 1
      },
      "hormone-harmony": { 
        sku: "hormone_harmony", 
        name: "Hormone Harmony", 
        price: 25000,
        defaultQuantity: 1
      },
      "brain-booster": { 
        sku: "brain_booster",
        name: "Brain Booster", 
        price: 25000,
        defaultQuantity: 1
      },
      "prostatitis": { 
        sku: "prostatitis", 
        name: "Prostatitis", 
        price: 25000,
        defaultQuantity: 1
      },
      "prosta-vitality": { 
        sku: "prosta_vitality", 
        name: "Prosta Vitality", 
        price: 25000,
        defaultQuantity: 1
      },
      "optifertile": { 
        sku: "optifertile", 
        name: "Optifertile", 
        price: 25000,
        defaultQuantity: 1
      },
      "liver-tea": { 
        sku: "liver_tea", 
        name: "Liver Tea", 
        price: 25000,
        defaultQuantity: 1
      },
      "eye-shield": { 
        sku: "eye_shield", 
        name: "Eye Shield", 
        price: 25000,
        defaultQuantity: 1
      },
      "activated-charcoal": { 
        sku: "activated_charcoal", 
        name: "Activated Charcoal", 
        price: 25000,
        defaultQuantity: 1
      },
      "thyro-plus": { 
        sku: "thyro_plus", 
        name: "Thyro Plus", 
        price: 25000,
        defaultQuantity: 1
      },
      "thyro-max": { 
        sku: "thyro_max",
        name: "Thyro Max", 
        price: 25000,
        defaultQuantity: 1
      },
      "sugar-shield-plus": { 
        sku: "sugar_shield_plus", 
        name: "Sugar Shield Plus", 
        price: 25000,
        defaultQuantity: 1
      },
      "immuno-guard": { 
        sku: "immuno_guard",
        name: "Immuno Guard", 
        price: 25000,
        defaultQuantity: 1
      },
      "soursop": { 
        sku: "soursop",
        name: "Soursop", 
        price: 25000,
        defaultQuantity: 1
      },
      "nephro-care": { 
        sku: "nephro_care", 
        name: "Nephro Care", 
        price: 25000,
        defaultQuantity: 1
      }
    }
  };

  // Initialize shopping cart
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
        id: product.sku, // Important: use sku as id for proper sync
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

  // Function to save cart to storage
  function saveCartToStorage() {
    const cartData = JSON.stringify(cart);
    try {
      // Save to multiple storage locations for compatibility
      sessionStorage.setItem('systemeCart', cartData);
      sessionStorage.setItem('teneraCart', cartData);
      sessionStorage.setItem('cartItems', cartData);
      localStorage.setItem('systemeCart', cartData);
      localStorage.setItem('teneraCart', cartData);
      localStorage.setItem('cartItems', cartData);
    } catch (e) {
      console.warn('Storage not available:', e);
    }
  }

  // Function to remove item from cart
  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCartToStorage();
      updateCartUI();
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
          <div class="item-name">${item.name}</div>
          <div class="item-price">${formatPrice(item.price)} × ${item.quantity}</div>
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
    notification.className = 'notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = isError ? '#e74c3c' : '#27ae60';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1001';
    notification.style.transition = 'all 0.5s';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px; font-size: 20px;">${isError ? '⚠️' : '🛒'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }

  // Enhanced proceedToCheckout function with proper Lovable app sync
  async function proceedToCheckout() {
    if (cart.length === 0) {
      showNotification('Your cart is empty', true);
      return;
    }
    
    showNotification('Synchronizing cart data...');
    
    // Format cart items for sync with proper structure
    const cartItems = cart.map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Prepare sync data for Lovable app
    const syncData = {
      cartItems: cartItems,
      customerInfo: {
        name: '', // Will be filled in the checkout form
        email: '', // Will be filled in the checkout form
        phone: ''
      },
      totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      source: window.location.href
    };
    
    log("Syncing cart data with Lovable app:", syncData);
    
    // Save cart data with multiple keys for maximum compatibility
    const cartData = JSON.stringify(cartItems);
    const orderData = JSON.stringify({
      items: cartItems,
      totalAmount: syncData.totalAmount,
      timestamp: new Date().toISOString(),
      source: window.location.href
    });
    
    try {
      sessionStorage.setItem('systemeCart', cartData);
      sessionStorage.setItem('teneraCart', cartData);
      sessionStorage.setItem('cartItems', cartData);
      sessionStorage.setItem('pendingOrderData', orderData);
      localStorage.setItem('systemeCart', cartData);
      localStorage.setItem('teneraCart', cartData);
      localStorage.setItem('cartItems', cartData);
      localStorage.setItem('pendingOrderData', orderData);
    } catch (e) {
      console.warn('Storage save failed:', e);
    }

    // Sync with Lovable app using the correct endpoint
    let syncSuccess = false;
    try {
      const response = await fetch(config.syncCartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(syncData)
      });
      
      if (response.ok) {
        const syncResult = await response.json();
        log("Cart sync successful:", syncResult);
        syncSuccess = true;
        showNotification('Cart synchronized successfully!');
      } else {
        console.warn("Cart sync failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.error('Cart sync error:', error);
    }

    // Send to orders API for analytics tracking
    try {
      await fetch(config.ordersApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(syncData)
      });
      log("Order data sent to analytics API");
    } catch (error) {
      console.error('Analytics API error:', error);
    }

    // Send postMessage for embedded Lovable app
    try {
      const messageData = {
        type: 'CHECKOUT_INITIATED',
        cartItems: cartItems,
        orderData: {
          items: cartItems,
          totalAmount: syncData.totalAmount
        },
        timestamp: new Date().toISOString()
      };

      window.postMessage(messageData, '*');
      
      // Also try sending to parent if we're in an iframe
      if (window.parent !== window) {
        window.parent.postMessage(messageData, '*');
      }
      
      log("PostMessage sent:", messageData);
    } catch (e) {
      console.error('PostMessage failed:', e);
    }

    // Redirect to order form with cart data
    const encodedCart = encodeURIComponent(cartData);
    const encodedOrderData = encodeURIComponent(orderData);
    let checkoutUrl = `${config.orderFormUrl}?cart=${encodedCart}&orderData=${encodedOrderData}&synced=${syncSuccess}&t=${Date.now()}`;
    
    log("Redirecting to:", checkoutUrl);
    
    // Short delay to ensure messages are sent
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 500);
  }

  // Function to clear all cart data
  function clearAllCartData() {
    cart = [];
    const storageKeys = [
      'systemeCart', 'teneraCart', 'cartItems', 
      'pendingOrderData', 'teneraOrderData', 'pendingCheckout'
    ];
    
    storageKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to clear ${key}:`, e);
      }
    });
    
    log('All cart data cleared');
  }

  // Enhanced message listener for Lovable app communication
  function setupMessageChannel() {
    window.addEventListener('message', function(event) {
      // Security: verify origin
      const allowedOrigins = [
        'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
        'https://www.teneraholisticandwellness.com',
        'https://teneraholisticandwellness.com'
      ];
      
      const isValidOrigin = allowedOrigins.some(origin => 
        event.origin === origin || event.origin.includes(origin.replace('https://', ''))
      );
      
      if (!isValidOrigin && event.origin !== window.location.origin) {
        return; // Ignore messages from invalid origins
      }
      
      log('Received message:', event.data);
      
      switch (event.data.type) {
        case 'ORDER_PROCESSED':
        case 'PAYMENT_SUCCESS':
          clearAllCartData();
          updateCartUI();
          showNotification('Order processed successfully!');
          break;
          
        case 'CART_RECEIVED':
          log('Lovable app confirmed cart receipt');
          showNotification('Cart data received by payment system');
          break;
          
        case 'REQUEST_CART_DATA':
          // Send current cart data to requesting app
          const responseData = {
            type: 'CART_DATA_RESPONSE',
            cart: cart,
            timestamp: new Date().toISOString()
          };
          
          if (event.source && typeof event.source.postMessage === 'function') {
            event.source.postMessage(responseData, event.origin);
          } else {
            window.postMessage(responseData, '*');
          }
          break;
          
        case 'SYNC_CONFIRMATION':
          log('Cart sync confirmed by Lovable app');
          break;
      }
    });
  }

  // Create cart UI function with enhanced styling
  function createCartUI() {
    if (document.getElementById('shopping-cart')) return; // Prevent duplicate creation
    
    const cartUI = document.createElement('div');
    cartUI.id = 'shopping-cart';
    cartUI.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart <span id="cart-count" class="cart-count">0</span></h3>
        <button class="toggle-cart" onclick="toggleCart()">▼</button>
      </div>
      <div class="cart-body">
        <div id="cart-items"></div>
        <div class="cart-footer">
          <div class="cart-total-row">
            <span>Total:</span>
            <span id="cart-total">${config.currency}0</span>
          </div>
          <button id="checkout-btn" onclick="proceedToCheckout()">Checkout</button>
        </div>
      </div>
    `;
    document.body.appendChild(cartUI);
    
    // Add comprehensive cart styles
    if (!document.getElementById('cart-styles')) {
      const cartStyles = document.createElement('style');
      cartStyles.id = 'cart-styles';
      cartStyles.textContent = `
        #shopping-cart {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 300px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        @media screen and (max-width: 767px) {
          #shopping-cart {
            width: 90%;
            right: 5%;
            bottom: 10px;
            max-width: 320px;
            font-size: 14px;
          }
        }
        
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: #f0f0f0;
          border-bottom: 1px solid #ddd;
        }
        .cart-header h3 {
          margin: 0;
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        .cart-count {
          display: inline-block;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          text-align: center;
          line-height: 20px;
          font-size: 12px;
          margin-left: 5px;
        }
        .toggle-cart {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .cart-body {
          max-height: 400px;
          overflow-y: auto;
        }
        #cart-items {
          padding: 10px 15px;
        }
        .cart-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .empty-cart {
          text-align: center;
          color: #999;
          padding: 20px 0;
        }
        .cart-footer {
          padding: 15px;
          background: #f9f9f9;
          border-top: 1px solid #eee;
        }
        .cart-total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 10px;
        }
        #checkout-btn {
          width: 100%;
          padding: 10px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        #checkout-btn:hover {
          background: #2ecc71;
        }
        .remove-item {
          background: none;
          border: none;
          color: #e74c3c;
          font-size: 18px;
          cursor: pointer;
          padding: 0 5px;
        }
        .cart-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 20%, 40%, 60%, 80%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
        }
      `;
      document.head.appendChild(cartStyles);
    }
  }

  // Function to toggle cart visibility
  function toggleCart() {
    const cartElement = document.getElementById('shopping-cart');
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

  // Initialize everything when DOM is ready
  function initialize() {
    // Restore cart from storage
    try {
      const savedCart = sessionStorage.getItem('systemeCart') || localStorage.getItem('systemeCart');
      if (savedCart && !sessionStorage.getItem('pendingCheckout')) {
        cart = JSON.parse(savedCart);
        log('Cart restored from storage:', cart);
      } else {
        clearAllCartData(); // Clear any pending checkout state
      }
    } catch (e) {
      cart = [];
      log('Failed to restore cart, starting fresh');
    }
    
    // Create cart UI
    createCartUI();
    updateCartUI();
    
    // Setup message channel
    setupMessageChannel();
    
    // Add event listeners to buy buttons
    const buyButtons = document.querySelectorAll('[data-product]');
    buyButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const productId = this.getAttribute('data-product');
        const quantityInput = document.querySelector(`input[data-quantity="${productId}"]`);
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        addToCart(productId, quantity);
      });
    });
    
    // Notify embedded Lovable app that we're ready
    setTimeout(() => {
      window.postMessage({
        type: 'CART_SYSTEM_READY',
        cartItemCount: cart.length,
        timestamp: new Date().toISOString()
      }, '*');
      log('Sent CART_SYSTEM_READY message');
    }, 1000);
  }

  // Expose API functions globally
  window.teneraCheckout = {
    sendToCheckout: proceedToCheckout,
    getCartData: () => cart,
    clearCart: clearAllCartData,
    syncWithLovableApp: async (cartData) => {
      try {
        const response = await fetch(config.syncCartUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartData)
        });
        return await response.json();
      } catch (error) {
        console.error('Sync failed:', error);
        return null;
      }
    },
    getProductConfig: () => config.products,
    testSync: async () => {
      const testData = {
        cartItems: [{
          id: 'test_product',
          sku: 'test_product',
          name: 'Test Product',
          price: 1000,
          quantity: 1
        }],
        customerInfo: { name: 'Test', email: 'test@example.com', phone: '' }
      };
      
      const result = await window.teneraCheckout.syncWithLovableApp(testData);
      log('Test sync result:', result);
      return result;
    }
  };

  // Expose individual functions
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.proceedToCheckout = proceedToCheckout;
  window.toggleCart = toggleCart;
  window.clearAllCartData = clearAllCartData;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  log("Enhanced Tenera-Lovable integration loaded successfully");
})();
