(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.teneraCartInitialized) {
    console.log('Tenera cart already initialized');
    return;
  }
  
  console.log("Tenera cart system initializing...");
  
  // Configuration - simplified with 2 products
  const config = {
    orderFormUrl: "https://www.teneraholisticandwellness.com/order-payment",
    lovableAppUrl: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com",
    currency: "₦",
    debug: true,
    products: {
      "blood-booster": { sku: "blood_booster", name: "Blood Booster", price: 25000, image: "/images/blood-booster.jpg" },
      "immuno-guard-plus": { sku: "immuno_guard_plus", name: "Immuno Guard Plus", price: 25000, image: "/images/immuno-guard-plus.jpg" },
      "vein-thrombus": { sku: "vein_thrombus", name: "Vein Thrombus", price: 25000, image: "/images/vein-thrombus.jpg" },
      "cardio-tincture": { sku: "cardio_tincture", name: "Cardio Tincture", price: 10000, image: "/images/cardio-tincture.jpg" },
      "cardio-sure": { sku: "cardio_sure", name: "Cardio Sure", price: 25000, image: "/images/cardio-sure.jpg" },
      "hormone-harmony": { sku: "hormone_harmony", name: "Hormone Harmony", price: 25000, image: "/images/hormone-harmony.jpg" },
      "brain-booster": { sku: "brain_booster", name: "Brain Booster", price: 25000, image: "/images/brain-booster.jpg" },
      "prostatitis": { sku: "prostatitis", name: "Prostatitis", price: 25000, image: "/images/prostatitis.jpg" },
      "prosta-vitality": { sku: "prosta_vitality", name: "Prosta Vitality", price: 25000, image: "/images/prosta-vitality.jpg" },
      "optifertile": { sku: "optifertile", name: "Optifertile", price: 25000, image: "/images/optifertile.jpg" },
      "liver-tea": { sku: "liver_tea", name: "Liver Tea", price: 25000, image: "/images/liver-tea.jpg" },
      "eye-shield": { sku: "eye_shield", name: "Eye Shield", price: 25000, image: "/images/eye-shield.jpg" },
      "activated-charcoal": { sku: "activated_charcoal", name: "Activated Charcoal", price: 25000, image: "/images/activated-charcoal.jpg" },
      "thyro-plus": { sku: "thyro_plus", name: "Thyro Plus", price: 25000, image: "/images/thyro-plus.jpg" },
      "thyro-max": { sku: "thyro_max", name: "Thyro Max", price: 25000, image: "/images/thyro-max.jpg" },
      "sugar-shield-plus": { sku: "sugar_shield_plus", name: "Sugar Shield Plus", price: 25000, image: "/images/sugar-shield-plus.jpg" },
      "immuno-guard": { sku: "immuno_guard", name: "Immuno Guard", price: 25000, image: "/images/immuno-guard.jpg" },
      "soursop": { sku: "soursop", name: "Soursop", price: 25000, image: "/images/soursop.jpg" },
      "nephro-care": { sku: "nephro_care", name: "Nephro Care", price: 25000, image: "/images/nephro-care.jpg" }
    }
  };

  let cart = [];
  let isInitialized = false;

  function log(...args) {
    if (config.debug) {
      try { console.log("[TeneraCart]:", ...args); } catch (e) {}
    }
  }

  const storage = {
    set: function(key, value) {
      try {
        const data = JSON.stringify(value);
        sessionStorage.setItem(key, data);
        localStorage.setItem(key, data);
        return true;
      } catch (e) { log('Storage set failed:', e.message); return false; }
    },
    get: function(key) {
      try { return JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null'); }
      catch (e) { log('Storage get failed:', e.message); return null; }
    },
    remove: function(key) {
      try { sessionStorage.removeItem(key); localStorage.removeItem(key); return true; }
      catch (e) { log('Storage remove failed:', e.message); return false; }
    }
  };

  function formatPrice(price) {
    try { return `${config.currency}${price.toLocaleString()}`; }
    catch (e) { return `${config.currency}${price}`; }
  }

  function addToCart(productId, quantity = 1) {
    try {
      log(`Adding ${productId} to cart, quantity: ${quantity}`);
      const product = config.products[productId];
      if (!product) { showNotification(`Product ${productId} not found`, true); return false; }
      const existingIndex = cart.findIndex(item => item.sku === product.sku);
      if (existingIndex > -1) { cart[existingIndex].quantity += quantity; }
      else {
        cart.push({ id: product.sku, sku: product.sku, name: product.name, price: product.price, quantity: quantity, image: product.image });
      }
      saveCartData();
      updateCartUI();
      showNotification(`Added ${quantity} ${product.name} to cart`);
      return true;
    } catch (e) { log('Add to cart error:', e); showNotification('Failed to add item to cart', true); return false; }
  }

  function removeFromCart(index) {
    try {
      if (index >= 0 && index < cart.length) {
        const removedItem = cart[index].name;
        cart.splice(index, 1);
        saveCartData();
        updateCartUI();
        showNotification(`Removed ${removedItem} from cart`);
        return true;
      }
      return false;
    } catch (e) { log('Remove from cart error:', e); showNotification('Failed to remove item', true); return false; }
  }

  function saveCartData() {
    try {
      const cartData = {
        items: cart,
        timestamp: new Date().toISOString(),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
      };
      // Save in all common formats for compatibility
      storage.set('teneraCart', cartData);
      storage.set('cartItems', cart);
      storage.set('systemeCart', cart);
      storage.set('pendingOrderData', cart);
      log('Cart data saved successfully');
      notifyExternalSystems();
    } catch (e) { log('Save cart data error:', e); }
  }

  function loadCartData() {
    try {
      // Try new format first
      const savedData = storage.get('teneraCart');
      if (savedData && savedData.items) {
        cart = savedData.items;
        log('Cart data loaded:', cart.length, 'items');
        return true;
      }
      // Try legacy formats
      const keys = ['cartItems', 'systemeCart', 'pendingOrderData'];
      for (const key of keys) {
        const legacyCart = storage.get(key);
        if (legacyCart && Array.isArray(legacyCart)) {
          cart = legacyCart;
          log(`Legacy cart data loaded from ${key}:`, cart.length, 'items');
          return true;
        }
      }
    } catch (e) { log('Load cart data error:', e); }
    cart = [];
    return false;
  }

  function notifyExternalSystems() {
    try {
      const syncData = {
        cartItems: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        timestamp: new Date().toISOString(),
        source: 'tenera_cart'
      };
      storage.set('cartSync', syncData);
      if (window.postMessage) {
        const messageData = {
          type: 'TENERA_CART_UPDATE',
          data: syncData,
          timestamp: new Date().toISOString()
        };
        setTimeout(() => {
          try {
            window.postMessage(messageData, '*');
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(messageData, '*');
            }
          } catch (e) { log('PostMessage error:', e.message); }
        }, 100);
      }
    } catch (e) { log('Notify external systems error:', e); }
  }

  function updateCartUI() {
    try {
      const cartContainer = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');
      const cartCount = document.getElementById('cart-count');
      if (!cartContainer) return;
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
            <div class="item-info">
              <div class="item-name">${item.name}</div>
              <div class="item-sku">SKU: ${item.sku}</div>
            </div>
            <div class="item-price">${formatPrice(item.price)} × ${item.quantity}</div>
            <div class="item-total">${formatPrice(itemTotal)}</div>
            <button class="remove-item" onclick="teneraCart.removeFromCart(${index})" title="Remove item">×</button>
          `;
          cartContainer.appendChild(cartItem);
        });
      }
      if (cartTotal) cartTotal.textContent = formatPrice(total);
      if (cartCount) cartCount.textContent = count;
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
      }
      try {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart, total, count } }));
      } catch (e) { log('Event dispatch error:', e); }
    } catch (e) { log('Update cart UI error:', e); }
  }

  function proceedToCheckout() {
    try {
      if (cart.length === 0) { showNotification('Your cart is empty', true); return false; }
      showNotification('Preparing checkout...');
      const checkoutData = {
        cartItems: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        timestamp: new Date().toISOString(),
        checkoutId: `checkout_${Date.now()}`
      };
      storage.set('checkoutData', checkoutData);
      try {
        window.postMessage({ type: 'CHECKOUT_INITIATED', data: checkoutData, timestamp: new Date().toISOString() }, '*');
        // Send cart data to parent window for embedded scenarios
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'TENERA_CART_UPDATE', data: checkoutData, timestamp: new Date().toISOString() }, '*');
        }
      } catch (e) { log('Checkout message error:', e); }
      const encodedData = encodeURIComponent(JSON.stringify(checkoutData));
      const checkoutUrl = `${config.orderFormUrl}?data=${encodedData}&t=${Date.now()}`;
      log('Redirecting to checkout:', checkoutUrl);
      setTimeout(() => { window.location.href = checkoutUrl; }, 500);
      return true;
    } catch (e) { log('Checkout error:', e); showNotification('Checkout failed. Please try again.', true); return false; }
  }

  function clearCart() {
    try {
      cart = [];
      const keys = ['teneraCart', 'cartItems', 'cartSync', 'checkoutData', 'systemeCart', 'pendingOrderData'];
      keys.forEach(key => storage.remove(key));
      updateCartUI();
      notifyExternalSystems();
      showNotification('Cart cleared');
      log('Cart cleared');
      return true;
    } catch (e) { log('Clear cart error:', e); showNotification('Failed to clear cart', true); return false; }
  }

  function showNotification(message, isError = false) {
    try {
      const existing = document.querySelectorAll('.tenera-notification');
      existing.forEach(n => n.remove());
      const notification = document.createElement('div');
      notification.className = `tenera-notification ${isError ? 'error' : 'success'}`;
      notification.style.cssText = `position: fixed;top: 20px;right: 20px;background: ${isError ? '#e74c3c' : '#27ae60'};color: white;padding: 12px 20px;border-radius: 6px;box-shadow: 0 4px 12px rgba(0,0,0,0.15);z-index: 10001;font-weight: 500;transition: all 0.3s ease;max-width: 300px;font-family: system-ui, -apple-system, sans-serif;`;
      notification.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 18px;">${isError ? '⚠️' : '✅'}</span><span>${message}</span></div>`;
      document.body.appendChild(notification);
      setTimeout(() => {
        try {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(-10px)';
          setTimeout(() => { if (document.body.contains(notification)) { document.body.removeChild(notification); } }, 300);
        } catch (e) {}
      }, 3000);
    } catch (e) { log('Show notification error:', e); try { alert(message); } catch (alertError) {} }
  }

  function createCartUI() {
    try {
      if (document.getElementById('tenera-cart')) { log('Cart UI already exists'); return; }
      const cartUI = document.createElement('div');
      cartUI.id = 'tenera-cart';
      cartUI.innerHTML = `
        <div class="cart-header">
          <h3>Cart <span id="cart-count" class="cart-badge">0</span></h3>
          <button class="cart-toggle" onclick="teneraCart.toggleCart()">🛒</button>
        </div>
        <div class="cart-body">
          <div id="cart-items"></div>
          <div class="cart-footer">
            <div class="cart-total">
              Total: <span id="cart-total">${config.currency}0</span>
            </div>
            <button id="checkout-btn" onclick="teneraCart.proceedToCheckout()">Proceed to Checkout</button>
            <button class="clear-cart-btn" onclick="teneraCart.clearCart()">Clear Cart</button>
          </div>
        </div>
      `;
      document.body.appendChild(cartUI);
      addCartStyles();
      log('Cart UI created successfully');
    } catch (e) { log('Create cart UI error:', e); }
  }

  function addCartStyles() {
    if (document.getElementById('tenera-cart-styles')) return;
    try {
      const styles = document.createElement('style');
      styles.id = 'tenera-cart-styles';
      styles.textContent = `
        #tenera-cart { position: fixed; bottom: 20px; right: 20px; width: 350px; max-width: 90vw; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 10000; font-family: system-ui, -apple-system, sans-serif; border: 1px solid #e1e5e9; }
        .cart-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
        .cart-header h3 { margin: 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .cart-badge { background: rgba(255,255,255,0.2); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
        .cart-toggle { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
        .cart-toggle:hover { background: rgba(255,255,255,0.1); }
        .cart-body { max-height: 400px; overflow-y: auto; }
        #cart-items { padding: 16px 20px; }
        .cart-item { display: grid; grid-template-columns: 1fr auto auto auto; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f3f4; }
        .cart-item:last-child { border-bottom: none; }
        .item-info { min-width: 0; }
        .item-name { font-weight: 500; color: #202124; }
        .item-sku { font-size: 12px; color: #5f6368; margin-top: 2px; }
        .item-price, .item-total { font-size: 14px; color: #5f6368; }
        .item-total { font-weight: 600; color: #202124; }
        .remove-item { background: #fee; border: 1px solid #fcc; color: #c33; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .remove-item:hover { background: #e74c3c; color: white; border-color: #e74c3c; }
        .empty-cart { text-align: center; color: #9aa0a6; padding: 40px 20px; font-style: italic; }
        .cart-footer { padding: 16px 20px; background: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e8eaed; }
        .cart-total { font-size: 18px; font-weight: 600; margin-bottom: 12px; text-align: center; color: #202124; }
        #checkout-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 8px; }
        #checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
        .clear-cart-btn { width: 100%; padding: 8px; background: transparent; color: #5f6368; border: 1px solid #dadce0; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .clear-cart-btn:hover { background: #f1f3f4; color: #202124; }
        @media (max-width: 768px) { #tenera-cart { width: calc(100vw - 40px); right: 20px; } }
      `;
      document.head.appendChild(styles);
    } catch (e) { log('Add cart styles error:', e); }
  }

  function toggleCart() {
    try {
      const cartBody = document.querySelector('#tenera-cart .cart-body');
      if (cartBody) {
        const isVisible = cartBody.style.display !== 'none';
        cartBody.style.display = isVisible ? 'none' : 'block';
      }
    } catch (e) { log('Toggle cart error:', e); }
  }

  function setupMessageListener() {
    try {
      window.addEventListener('message', (event) => {
        try {
          if (!event.data || typeof event.data !== 'object') return;
          log('Received message:', event.data.type);
          switch (event.data.type) {
            case 'CART_REQUEST': notifyExternalSystems(); break;
            case 'ORDER_COMPLETE': clearCart(); showNotification('Order completed successfully!'); break;
            case 'CLEAR_CART': clearCart(); break;
          }
        } catch (e) { log('Message handler error:', e); }
      }, { passive: true });
    } catch (e) { log('Setup message listener error:', e); }
  }

  function setupClickHandlers() {
    try {
      document.addEventListener('click', (e) => {
        try {
          if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-product')) {
            e.preventDefault();
            const productId = e.target.getAttribute('data-product');
            const quantityInput = document.querySelector(`[data-quantity="${productId}"]`);
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            addToCart(productId, quantity);
          }
        } catch (clickError) { log('Click handler error:', clickError); }
      }, { passive: false });
    } catch (e) { log('Setup click handlers error:', e); }
  }

  function initialize() {
    try {
      if (isInitialized) { log('Already initialized'); return; }
      log('Initializing cart system...');
      loadCartData();
      createCartUI();
      updateCartUI();
      setupMessageListener();
      setupClickHandlers();
      if (cart.length > 0) { notifyExternalSystems(); }
      isInitialized = true;
      window.teneraCartInitialized = true;
      log('Cart system initialized successfully with', cart.length, 'items');
    } catch (e) { log('Initialize error:', e); showNotification('Cart system failed to initialize', true); }
  }

  window.teneraCart = {
    addToCart,
    removeFromCart,
    clearCart,
    proceedToCheckout,
    toggleCart,
    getCart: () => [...cart],
    refreshCart: () => { loadCartData(); updateCartUI(); notifyExternalSystems(); },
    isReady: () => isInitialized
  };

  if (!window.addToCart) window.addToCart = addToCart;
  if (!window.removeFromCart) window.removeFromCart = removeFromCart;
  if (!window.proceedToCheckout) window.proceedToCheckout = proceedToCheckout;
  if (!window.toggleCart) window.toggleCart = toggleCart;
  if (!window.clearCart) window.clearCart = clearCart;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 100);
  }

  log('Tenera cart script loaded');
})(); 