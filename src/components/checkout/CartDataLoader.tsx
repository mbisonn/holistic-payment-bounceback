import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { validateCartItems } from '@/utils/cart/cartValidationUtils';
import { useToast } from '@/hooks/use-toast';

const CartDataLoader = () => {
  const { updateCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const loadCartFromStorage = () => {
      // Check multiple storage locations for cart data
      const storageKeys = [
        'systemeCart',
        'teneraCart', 
        'cartItems',
        'pendingOrderData'
      ];

      for (const key of storageKeys) {
        try {
          // Check localStorage first
          let cartData = localStorage.getItem(key);
          
          // If not found, check sessionStorage
          if (!cartData) {
            cartData = sessionStorage.getItem(key);
          }
          
          if (cartData) {
            console.log(`Found cart data in ${key}:`, cartData);
            
            let parsedData;
            try {
              parsedData = JSON.parse(cartData);
            } catch (parseError) {
              console.error(`Error parsing cart data from ${key}:`, parseError);
              continue;
            }
            
            // Handle different data structures
            let items = [];
            if (Array.isArray(parsedData)) {
              items = parsedData;
            } else if (parsedData.items && Array.isArray(parsedData.items)) {
              items = parsedData.items;
            } else if (parsedData.cartItems && Array.isArray(parsedData.cartItems)) {
              items = parsedData.cartItems;
            } else {
              console.log(`Invalid data structure in ${key}:`, parsedData);
              continue;
            }
            
            // Validate and load cart items
            const validation = validateCartItems(items);
            
            if (validation.isValid && validation.items.length > 0) {
              console.log(`Loading ${validation.items.length} valid items from ${key}`);
              updateCart(validation.items);
              
              toast({
                title: "Cart Loaded",
                description: `Found ${validation.items.length} item(s) from your previous session`,
              });
              
              return; // Exit on first successful load
            } else if (validation.errors && validation.errors.length > 0) {
              console.warn(`Cart validation errors for ${key}:`, validation.errors);
            }
          }
        } catch (error) {
          console.error(`Error loading cart from ${key}:`, error);
        }
      }
    };

    // Load cart data immediately
    loadCartFromStorage();

    // Listen for postMessage events from external sources
    const handleMessage = (event: MessageEvent) => {
      console.log('CartDataLoader received message:', event.data);
      
      if (!event.data) return;
      
      // Handle cart data from external sources
      if (event.data.type === 'CART_DATA' && event.data.cart) {
        console.log('Processing external cart data:', event.data.cart);
        
        const validation = validateCartItems(event.data.cart);
        
        if (validation.isValid && validation.items.length > 0) {
          console.log(`Loading ${validation.items.length} items from external source`);
          
          updateCart(validation.items);
          
          // Store in localStorage for persistence
          try {
            localStorage.setItem('systemeCart', JSON.stringify(validation.items));
            localStorage.setItem('teneraCart', JSON.stringify(validation.items));
          } catch (storageError) {
            console.error('Error saving cart to storage:', storageError);
          }
          
          toast({
            title: "Cart Updated",
            description: `Loaded ${validation.items.length} item(s) from external source`,
          });
        } else {
          console.warn('Invalid cart data from external source:', validation.errors);
        }
      }
      
      // Handle checkout button click from external sources
      if (event.data.type === 'CHECKOUT_BUTTON_CLICKED' && event.data.cart) {
        console.log('Processing checkout button click with cart:', event.data.cart);
        
        const validation = validateCartItems(event.data.cart);
        
        if (validation.isValid && validation.items.length > 0) {
          updateCart(validation.items);
          
          // Store in localStorage
          try {
            localStorage.setItem('systemeCart', JSON.stringify(validation.items));
            localStorage.setItem('teneraCart', JSON.stringify(validation.items));
          } catch (storageError) {
            console.error('Error saving cart to storage:', storageError);
          }
          
          toast({
            title: "Ready for Checkout",
            description: `${validation.items.length} item(s) ready for payment`,
          });
        }
      }
    };

    // Set up message listener
    window.addEventListener('message', handleMessage);
    
    // Send ready signal to parent window (for iframe integration)
    const sendReadySignal = () => {
      try {
        // Send to parent window if in iframe
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'CART_READY',
            timestamp: new Date().toISOString()
          }, '*');
        }
        
        // Send to current window for local listeners
        window.postMessage({
          type: 'CART_READY',
          timestamp: new Date().toISOString()
        }, '*');
      } catch (error) {
        console.error('Error sending ready signal:', error);
      }
    };
    
    // Send ready signal after a short delay
    const readyTimer = setTimeout(sendReadySignal, 500);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(readyTimer);
    };
  }, [updateCart, toast]);

  return null; // This is a utility component with no UI
};

export default CartDataLoader;
