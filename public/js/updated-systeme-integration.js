(function() {
    'use strict';
    
    console.log('[Tenera Integration] Script loaded at:', new Date().toISOString());
    
    // Configuration
    const CONFIG = {
        PAYMENT_HUB_URL: 'https://holistic-payment-hub-16.lovable.app/',
        STORAGE_KEY: 'TeneraShoppingCart',
        DEBUG: true
    };
    
    // Enhanced product catalog with complete mapping
    const PRODUCT_CATALOG = {
        'blood_booster': { id: 'blood_booster', sku: 'blood_booster', name: 'Blood Booster', price: 25000 },
        'immuno_guard_plus': { id: 'immuno_guard_plus', sku: 'immuno_guard_plus', name: 'Immuno Guard Plus', price: 25000 },
        'vein_thrombus': { id: 'vein_thrombus', sku: 'vein_thrombus', name: 'Vein Thrombus', price: 25000 },
        'cardio_tincture': { id: 'cardio_tincture', sku: 'cardio_tincture', name: 'Cardio Tincture', price: 10000 },
        'cardio_sure': { id: 'cardio_sure', sku: 'cardio_sure', name: 'Cardio Sure', price: 25000 },
        'hormone_harmony': { id: 'hormone_harmony', sku: 'hormone_harmony', name: 'Hormone Harmony', price: 25000 },
        'brain_booster': { id: 'brain_booster', sku: 'brain_booster', name: 'Brain Booster', price: 25000 },
        'prostatitis': { id: 'prostatitis', sku: 'prostatitis', name: 'Prostatitis', price: 25000 },
        'prosta_vitality': { id: 'prosta_vitality', sku: 'prosta_vitality', name: 'Prosta Vitality', price: 25000 },
        'optifertile': { id: 'optifertile', sku: 'optifertile', name: 'Optifertile', price: 25000 },
        'liver_tea': { id: 'liver_tea', sku: 'liver_tea', name: 'Liver Tea', price: 25000 },
        'eye_shield': { id: 'eye_shield', sku: 'eye_shield', name: 'Eye Shield', price: 25000 },
        'activated_charcoal': { id: 'activated_charcoal', sku: 'activated_charcoal', name: 'Activated Charcoal', price: 25000 },
        'thyro_plus': { id: 'thyro_plus', sku: 'thyro_plus', name: 'Thyro Plus', price: 25000 },
        'thyro_max': { id: 'thyro_max', sku: 'thyro_max', name: 'Thyro Max', price: 25000 },
        'sugar_shield_plus': { id: 'sugar_shield_plus', sku: 'sugar_shield_plus', name: 'Sugar Shield Plus', price: 25000 },
        'immuno_guard': { id: 'immuno_guard', sku: 'immuno_guard', name: 'Immuno Guard', price: 25000 },
        'soursop': { id: 'soursop', sku: 'soursop', name: 'Soursop', price: 25000 },
        'nephro_care': { id: 'nephro_care', sku: 'nephro_care', name: 'Nephro Care', price: 25000 }
    };
    
    // Cart management
    class TeneraCart {
        constructor() {
            this.items = [];
            this.loadFromStorage();
            this.setupAutoSave();
            this.setupPageRefreshListener();
        }
        
        loadFromStorage() {
            try {
                const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (stored) {
                    this.items = JSON.parse(stored);
                    CONFIG.DEBUG && console.log('[TeneraCart] Loaded from storage:', this.items);
                }
            } catch (e) {
                CONFIG.DEBUG && console.error('[TeneraCart] Error loading from storage:', e);
            }
        }
        
        saveToStorage() {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.items));
                CONFIG.DEBUG && console.log('[TeneraCart] Saved to storage:', this.items);
            } catch (e) {
                CONFIG.DEBUG && console.error('[TeneraCart] Error saving to storage:', e);
            }
        }
        
        setupAutoSave() {
            // Auto-save every 2 seconds if cart has changed
            setInterval(() => {
                this.saveToStorage();
                this.syncWithPaymentHub();
            }, 2000);
        }

        setupPageRefreshListener() {
            // Send cart data on page load/refresh
            window.addEventListener('load', () => {
                if (this.items.length > 0) {
                    this.syncWithPaymentHub();
                    CONFIG.DEBUG && console.log('[TeneraCart] Page loaded - syncing cart:', this.items);
                }
            });

            // Also sync when page becomes visible (tab switch)
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.items.length > 0) {
                    this.syncWithPaymentHub();
                    CONFIG.DEBUG && console.log('[TeneraCart] Page visible - syncing cart');
                }
            });
        }
        
        addProduct(sku, quantity = 1) {
            const product = PRODUCT_CATALOG[sku.toLowerCase()];
            if (!product) {
                console.warn('[TeneraCart] Product not found:', sku);
                return false;
            }
            
            const existingIndex = this.items.findIndex(item => item.sku === sku);
            if (existingIndex >= 0) {
                this.items[existingIndex].quantity += quantity;
            } else {
                this.items.push({
                    ...product,
                    quantity: quantity
                });
            }
            
            this.saveToStorage();
            this.syncWithPaymentHub();
            CONFIG.DEBUG && console.log('[TeneraCart] Added product:', sku, 'Cart:', this.items);
            return true;
        }
        
        removeProduct(sku) {
            this.items = this.items.filter(item => item.sku !== sku);
            this.saveToStorage();
            this.syncWithPaymentHub();
        }
        
        updateQuantity(sku, quantity) {
            const index = this.items.findIndex(item => item.sku === sku);
            if (index >= 0) {
                if (quantity <= 0) {
                    this.removeProduct(sku);
                } else {
                    this.items[index].quantity = quantity;
                    this.saveToStorage();
                    this.syncWithPaymentHub();
                }
            }
        }
        
        clearCart() {
            this.items = [];
            this.saveToStorage();
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            CONFIG.DEBUG && console.log('[TeneraCart] Cart cleared');
        }
        
        getItems() {
            return [...this.items];
        }
        
        getTotal() {
            return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        refresh() {
            this.saveToStorage();
            this.syncWithPaymentHub();
            // Force a page refresh of cart display
            window.dispatchEvent(new CustomEvent('teneraCartUpdated', { 
                detail: { items: this.getItems(), total: this.getTotal() } 
            }));
        }
        
        syncWithPaymentHub() {
            if (this.items.length === 0) return;
            
            try {
                // Send cart data to payment hub via postMessage
                const message = {
                    type: 'TENERA_CART_UPDATE',
                    data: {
                        cart: this.getItems(),
                        total: this.getTotal()
                    },
                    timestamp: new Date().toISOString(),
                    source: 'systeme-integration'
                };
                
                // Try multiple ways to communicate with payment hub
                if (window.parent !== window) {
                    window.parent.postMessage(message, CONFIG.PAYMENT_HUB_URL);
                }
                
                window.postMessage(message, '*');
                
                // Store the entire message object under TeneraShoppingCart
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(message));
                
                CONFIG.DEBUG && console.log('[TeneraCart] Synced with payment hub:', message);
            } catch (e) {
                CONFIG.DEBUG && console.error('[TeneraCart] Sync error:', e);
            }
        }
        
        checkout() {
            if (this.items.length === 0) {
                alert('Your cart is empty. Please add some products first.');
                return;
            }
            
            // Immediate sync before checkout
            this.syncWithPaymentHub();
            
            // Debug: Log localStorage content before checkout
            CONFIG.DEBUG && console.log('[TeneraCart] localStorage content before checkout:', localStorage.getItem(CONFIG.STORAGE_KEY));
            
            // Try to communicate with payment hub
            const checkoutData = {
                type: 'CHECKOUT_INITIATED',
                cartItems: this.getItems(),
                total: this.getTotal(),
                timestamp: new Date().toISOString()
            };
            
            // Send checkout event
            window.postMessage(checkoutData, '*');
            if (window.parent !== window) {
                window.parent.postMessage(checkoutData, '*');
            }
            
            // Store checkout data
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            
            // Open payment hub with cart data
            const cartParam = encodeURIComponent(JSON.stringify(this.getItems()));
            const checkoutUrl = `${CONFIG.PAYMENT_HUB_URL}?cart=${cartParam}&checkout=true&t=${Date.now()}`;
            
            CONFIG.DEBUG && console.log('[TeneraCart] Opening checkout:', checkoutUrl);
            
            // Open in new window
            const checkoutWindow = window.open(checkoutUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            if (!checkoutWindow) {
                // Fallback if popup blocked
                window.location.href = checkoutUrl;
            }
        }
    }
    
    // Initialize cart
    const cart = new TeneraCart();
    
    // Setup event listeners
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Tenera Integration] DOM loaded, setting up event listeners');
        
        // Handle add to cart buttons
        document.addEventListener('click', function(e) {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const sku = button.getAttribute('data-product-sku');
                const quantity = parseInt(button.getAttribute('data-quantity') || '1');
                
                if (sku && cart.addProduct(sku, quantity)) {
                    button.textContent = 'Added!';
                    button.style.backgroundColor = '#10B981';
                    setTimeout(() => {
                        button.textContent = 'Add to Cart';
                        button.style.backgroundColor = '';
                    }, 2000);
                } else {
                    console.warn('[Tenera Integration] Invalid product SKU:', sku);
                }
            }
            
            // Handle checkout buttons
            if (e.target.matches('[data-checkout]') || e.target.closest('[data-checkout]')) {
                e.preventDefault();
                cart.checkout();
            }
        });
    });
    
    // Expose global API
    window.TeneraCart = {
        addProduct: (sku, quantity) => cart.addProduct(sku, quantity),
        removeProduct: (sku) => cart.removeProduct(sku),
        updateQuantity: (sku, quantity) => cart.updateQuantity(sku, quantity),
        clearCart: () => cart.clearCart(),
        getItems: () => cart.getItems(),
        getTotal: () => cart.getTotal(),
        checkout: () => cart.checkout(),
        refresh: () => cart.refresh()
    };
    
    // Enhanced page refresh functionality
    window.addEventListener('pagehide', function() {
        if (cart.getItems().length > 0) {
            cart.syncWithPaymentHub();
        }
    });
    
    // Auto-sync every few seconds and on page visibility
    setInterval(() => {
        if (cart.getItems().length > 0) {
            cart.syncWithPaymentHub();
        }
    }, 3000);
    
    console.log('[Tenera Integration] Ready! Cart API available globally.');
    console.log('[Tenera Integration] Available products:', Object.keys(PRODUCT_CATALOG).length);
})();
