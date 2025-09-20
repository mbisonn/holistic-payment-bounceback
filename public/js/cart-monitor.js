
/**
 * Cart monitoring and debugging utility
 * Include this script on sales pages to help debug cart integration issues
 */

(function() {
  // Create a simple monitoring UI
  function createMonitorUI() {
    const monitorDiv = document.createElement('div');
    monitorDiv.id = 'cart-monitor';
    monitorDiv.style.position = 'fixed';
    monitorDiv.style.bottom = '10px';
    monitorDiv.style.left = '10px';
    monitorDiv.style.background = 'rgba(0,0,0,0.7)';
    monitorDiv.style.color = 'white';
    monitorDiv.style.padding = '10px';
    monitorDiv.style.borderRadius = '5px';
    monitorDiv.style.fontSize = '12px';
    monitorDiv.style.zIndex = '9999';
    monitorDiv.style.maxWidth = '300px';
    monitorDiv.style.maxHeight = '200px';
    monitorDiv.style.overflow = 'auto';
    monitorDiv.style.display = 'none'; // Hidden by default

    monitorDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <strong>Cart Monitor</strong>
        <button id="toggle-monitor" style="background: none; border: none; color: white; cursor: pointer;">-</button>
      </div>
      <div id="monitor-content">
        <div>Cart Items: <span id="monitor-count">0</span></div>
        <div>Sync Status: <span id="cart-sync-status">Not synced</span></div>
        <div>Last Updated: <span id="monitor-timestamp">Never</span></div>
      </div>
      <div style="margin-top: 5px; display: flex; justify-content: space-between;">
        <button id="monitor-test-btn" style="font-size: 10px; padding: 2px 5px;">Test Sync</button>
        <button id="monitor-clear-btn" style="font-size: 10px; padding: 2px 5px;">Clear Cart</button>
        <button id="monitor-show-btn" style="font-size: 10px; padding: 2px 5px;">View Data</button>
      </div>
    `;

    document.body.appendChild(monitorDiv);

    // Toggle visibility with Ctrl+Shift+D
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        monitorDiv.style.display = monitorDiv.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Set up buttons
    document.getElementById('toggle-monitor').addEventListener('click', function() {
      const content = document.getElementById('monitor-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
      this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    document.getElementById('monitor-test-btn').addEventListener('click', function() {
      // Send test cart data
      const testItem = {
        id: 'test_item_' + Date.now(),
        sku: 'test_item_' + Date.now(),
        name: 'Test Product',
        price: 1000,
        quantity: 1
      };
      
      // Try to use the sendCartToCheckout function
      if (window.sendCartToCheckout && typeof window.sendCartToCheckout === 'function') {
        window.sendCartToCheckout([testItem]);
        updateMonitorInfo([testItem]);
      } else {
        console.error("sendCartToCheckout function not found");
      }
    });

    document.getElementById('monitor-clear-btn').addEventListener('click', function() {
      // Clear cart data
      if (window.clearCart && typeof window.clearCart === 'function') {
        window.clearCart();
        updateMonitorInfo([]);
      } else {
        // Fallback clear implementation
        ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'].forEach(key => {
          localStorage.removeItem(key);
        });
        sessionStorage.removeItem('teneraCartData');
        updateMonitorInfo([]);
      }
    });

    document.getElementById('monitor-show-btn').addEventListener('click', function() {
      // Show cart data
      let cartData = [];
      try {
        const data = localStorage.getItem('systemeCart') || 
                    localStorage.getItem('cart') || 
                    localStorage.getItem('teneraCart');
        if (data) {
          cartData = JSON.parse(data);
        }
      } catch (e) {
        console.error("Error parsing cart data:", e);
      }
      
      alert(JSON.stringify(cartData, null, 2));
    });

    // Update monitor info on load
    updateMonitorInfo(getCartDataFromStorage());
    
    return monitorDiv;
  }

  function getCartDataFromStorage() {
    try {
      const storageKeys = ['systemeCart', 'cart', 'cartItems', 'teneraCart', 'pendingOrderData'];
      
      for (const key of storageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              return parsedData;
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e);
          }
        }
      }
      
      return [];
    } catch (e) {
      return [];
    }
  }

  function updateMonitorInfo(cartItems) {
    const countElement = document.getElementById('monitor-count');
    const timestampElement = document.getElementById('monitor-timestamp');
    const syncStatusElement = document.getElementById('cart-sync-status');
    
    if (countElement && timestampElement && syncStatusElement) {
      countElement.textContent = Array.isArray(cartItems) ? cartItems.length : 0;
      timestampElement.textContent = new Date().toLocaleTimeString();
      syncStatusElement.textContent = "Pending sync...";
      syncStatusElement.className = "";
      
      // Listen for cart received acknowledgement
      const messageHandler = function(event) {
        if (event.data && event.data.type === 'CART_RECEIVED') {
          syncStatusElement.textContent = "✓ Cart synced";
          syncStatusElement.className = "sync-success";
          syncStatusElement.style.color = '#4CAF50';
          
          // Remove this listener after getting confirmation
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Set timeout to mark as failed if no confirmation
      setTimeout(() => {
        if (syncStatusElement.textContent === "Pending sync...") {
          syncStatusElement.textContent = "✗ Sync failed";
          syncStatusElement.className = "sync-failed";
          syncStatusElement.style.color = '#F44336';
          
          // Clean up listener
          window.removeEventListener('message', messageHandler);
        }
      }, 5000);
    }
  }

  // Set up message listeners for cart events
  function setupCartMessageListeners() {
    window.addEventListener('message', function(event) {
      if (!event.data || typeof event.data !== 'object') return;
      
      console.log("Cart monitor received message:", event.data.type || 'unknown type');
      
      if (event.data.type === 'CART_DATA' || event.data.type === 'ADD_TO_CART') {
        // Update monitor when cart data is sent
        if (event.data.cart || event.data.payload) {
          const cartItems = event.data.cart || event.data.payload;
          updateMonitorInfo(cartItems);
        }
      }
    });
  }

  // Initialize monitor when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('debug=true') || 
        localStorage.getItem('enableCartMonitor') === 'true') {
      createMonitorUI();
      setupCartMessageListeners();
      console.log("Cart monitor initialized. Press Ctrl+Shift+D to toggle visibility.");
    }
  });
  
  // Expose control function globally
  window.toggleCartMonitor = function(enable) {
    if (enable) {
      localStorage.setItem('enableCartMonitor', 'true');
      if (!document.getElementById('cart-monitor')) {
        const monitor = createMonitorUI();
        monitor.style.display = 'block';
        setupCartMessageListeners();
      }
    } else {
      localStorage.removeItem('enableCartMonitor');
      const monitor = document.getElementById('cart-monitor');
      if (monitor) {
        document.body.removeChild(monitor);
      }
    }
  };
})();
