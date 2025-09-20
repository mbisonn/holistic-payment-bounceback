
/**
 * Enhanced integration script for Systeme.io to Tenera Holistic Payment Hub
 * This script should be embedded in your Systeme.io landing page
 */

(function() {
  console.log("Tenera Systeme.io integration initializing...");
  
  // Configuration - Updated to match your requirements
  const config = {
    orderFormUrl: "https://www.teneraholisticandwellness.com/order-payment",
    dataPostUrl: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
    currency: "₦",
    debug: true,
    // Your product catalog matching the SKUs in your Lovable project
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

  // Enhanced proceedToCheckout function for better integration
  function proceedToCheckout() {
    if (cart.length === 0) {
      showNotification('Your cart is empty');
      return;
    }
    
    // Format cart items to match Lovable project expectations
    const cartItems = cart.map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    // Store cart data in multiple locations for maximum compatibility
    const cartData = JSON.stringify(cartItems);
    localStorage.setItem('systemeCart', cartData);
    localStorage.setItem('cart', cartData);
    localStorage.setItem('cartItems', cartData);
    localStorage.setItem('teneraCart', cartData);
    localStorage.setItem('pendingOrderData', cartData);
    
    console.log("Cart data prepared for Tenera checkout:", cartItems);
    
    // Send data to Lovable project API
    fetch(config.dataPostUrl, {
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
    .then(data => {
      console.log("Order data sent to Tenera successfully:", data);
      
      // Redirect to Tenera order payment page with cart data
      const encodedCart = encodeURIComponent(JSON.stringify(cartItems));
      const checkoutUrl = `${config.orderFormUrl}?cart=${encodedCart}&t=${Date.now()}`;
      
      console.log("Redirecting to:", checkoutUrl);
      window.location.href = checkoutUrl;
    })
    .catch(error => {
      console.error('Error sending order data:', error);
      
      // Still redirect with cart data in URL as fallback
      const encodedCart = encodeURIComponent(JSON.stringify(cartItems));
      window.location.href = `${config.orderFormUrl}?cart=${encodedCart}&t=${Date.now()}`;
    });
  }

  // Replace the existing proceedToCheckout function
  window.proceedToCheckout = proceedToCheckout;
  
  // Make cart management functions available globally
  window.teneraCheckout = {
    sendToCheckout: function(cartItems) {
      // Set the global cart and proceed to checkout
      if (Array.isArray(cartItems)) {
        window.cart = cartItems;
      }
      proceedToCheckout();
    },
    
    getCartData: function() {
      try {
        return JSON.parse(localStorage.getItem('systemeCart') || '[]');
      } catch (e) {
        return [];
      }
    },
    
    clearCart: function() {
      window.cart = [];
      localStorage.removeItem('systemeCart');
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('teneraCart');
      localStorage.removeItem('pendingOrderData');
      updateCartUI();
      console.log("Cart cleared");
    }
  };
  
  console.log("Tenera Systeme.io integration loaded successfully");
})();
