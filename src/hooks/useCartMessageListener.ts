
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { handleCartMessage, sendReadyMessage } from '@/utils/cartMessageHandler';
import { useToast } from '@/hooks/use-toast';

export const useCartMessageListener = () => {
  const { updateCart } = useCart();
  const toastApi = useToast();
  
  useEffect(() => {
    console.log("CartMessageListener - Setting up enhanced integration with external cart systems");
    
    // Send ready message immediately and with retries for better timing
    sendReadyMessage();
    
    // Send ready message multiple times with improved timing to ensure external scripts receive it
    const readyIntervals = [100, 300, 500, 1000, 2000, 3000, 5000, 8000];
    const timers = readyIntervals.map(delay => 
      setTimeout(() => {
        console.log(`CartMessageListener - Sending ready message after ${delay}ms`);
        sendReadyMessage();
      }, delay)
    );
    
    // Enhanced message event listener with better error handling
    const messageHandler = (event: MessageEvent) => {
      // Skip our own messages to avoid loops
      if (event.source === window && event.data?.source === 'lovable_app') {
        return;
      }
      
      // Log all incoming messages for debugging
      console.log('CartMessageListener - Received message:', {
        type: event.data?.type,
        origin: event.origin,
        hasData: !!event.data?.data,
        dataKeys: event.data?.data ? Object.keys(event.data.data) : 'no data',
        fullMessage: event.data
      });
      
      try {
        handleCartMessage(event, updateCart);
      } catch (error) {
        console.error('CartMessageListener - Error handling message:', error instanceof Error ? error.message : 'Unknown error');
        // Don't throw - continue processing other messages
      }
    };
    
    // Enhanced error handling for message listeners
    const safeAddEventListener = (target: Window, handler: (event: MessageEvent) => void) => {
      try {
        target.addEventListener('message', handler);
        return true;
      } catch (error) {
        console.log('CartMessageListener - Could not add listener to target (expected in some contexts):', error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    };
    
    // Add message listeners with error handling
    safeAddEventListener(window, messageHandler);
    
    // Also listen for messages from parent window if in iframe
    let parentListenerAdded = false;
    if (window.parent && window.parent !== window) {
      parentListenerAdded = safeAddEventListener(window.parent, messageHandler);
    }
    
    // Check URL parameters for cart data on load
    const checkUrlForCartData = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cartParam = urlParams.get('cart');
      const orderDataParam = urlParams.get('orderData');
      
      if (orderDataParam) {
        try {
          const orderData = JSON.parse(decodeURIComponent(orderDataParam));
          if (orderData.items && Array.isArray(orderData.items)) {
            console.log('CartMessageListener - Found orderData in URL:', orderData.items);
            const fakeEvent = {
              data: { type: 'CART_DATA', cart: orderData.items },
              origin: window.location.origin
            } as MessageEvent;
            handleCartMessage(fakeEvent, updateCart);
          }
        } catch (parseError) {
          console.error('Error parsing orderData from URL:', parseError instanceof Error ? parseError.message : 'Unknown parsing error');
        }
      } else if (cartParam) {
        try {
          const cartData = JSON.parse(decodeURIComponent(cartParam));
          if (Array.isArray(cartData)) {
            console.log('CartMessageListener - Found cart in URL:', cartData);
            const fakeEvent = {
              data: { type: 'CART_DATA', cart: cartData },
              origin: window.location.origin
            } as MessageEvent;
            handleCartMessage(fakeEvent, updateCart);
          }
        } catch (parseError) {
          console.error('Error parsing cart data from URL:', parseError instanceof Error ? parseError.message : 'Unknown parsing error');
        }
      }
    };
    
    // Check URL parameters immediately
    checkUrlForCartData();
    
    // Enhanced localStorage monitoring with more frequent checks for TENERA_CART_UPDATE
    const checkStorageInterval = setInterval(() => {
      const storageKeys = ['TENERA_CART_UPDATE', 'systemeCart', 'teneraCart', 'cartItems', 'pendingOrderData'];
      
      for (const key of storageKeys) {
        try {
          const storageData = localStorage.getItem(key);
          if (storageData && storageData !== 'null' && storageData !== '[]') {
            console.log(`CartMessageListener - Found data in ${key}:`, storageData.substring(0, 100) + '...');
            const cartData = JSON.parse(storageData);
            
            let cartItems = [];
            
            // Enhanced TENERA_CART_UPDATE format handling
            if (key === 'TENERA_CART_UPDATE') {
              console.log('CartMessageListener - Processing TENERA_CART_UPDATE structure:', Object.keys(cartData));
              
              // Try multiple nested structures
              if (cartData.data && cartData.data.data && Array.isArray(cartData.data.data.cartItems)) {
                cartItems = cartData.data.data.cartItems;
                console.log('CartMessageListener - Found items in data.data.data.cartItems');
              } else if (cartData.data && Array.isArray(cartData.data.cartItems)) {
                cartItems = cartData.data.cartItems;
                console.log('CartMessageListener - Found items in data.data.cartItems');
              } else if (cartData.data && Array.isArray(cartData.data)) {
                cartItems = cartData.data;
                console.log('CartMessageListener - Found items in data.data array');
              } else if (cartData.cartItems && Array.isArray(cartData.cartItems)) {
                cartItems = cartData.cartItems;
                console.log('CartMessageListener - Found items in cartItems');
              }
            } else if (Array.isArray(cartData)) {
              cartItems = cartData;
            } else if (cartData.items && Array.isArray(cartData.items)) {
              cartItems = cartData.items;
            }
            
            if (cartItems.length > 0) {
              console.log(`CartMessageListener - Processing ${cartItems.length} items from ${key}`);
              const fakeEvent = {
                data: { type: 'CART_DATA', cart: cartItems },
                origin: window.location.origin
              } as MessageEvent;
              handleCartMessage(fakeEvent, updateCart);
              
              // Don't clear TENERA_CART_UPDATE as it might be needed for external checkout
              if (key !== 'TENERA_CART_UPDATE') {
                localStorage.removeItem(key);
              }
              break;
            } else {
              console.log(`CartMessageListener - No valid cart items found in ${key}`);
            }
          }
        } catch (storageError) {
          console.error(`Error checking storage key ${key}:`, storageError instanceof Error ? storageError.message : 'Unknown storage error');
        }
      }
    }, 500); // Check every 500ms for faster response
    
    // Cleanup function with enhanced error handling
    return () => {
      try {
        window.removeEventListener('message', messageHandler);
      } catch (cleanupError) {
        console.log('Error removing window message listener:', cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error');
      }
      
      if (parentListenerAdded && window.parent && window.parent !== window) {
        try {
          window.parent.removeEventListener('message', messageHandler);
        } catch (cleanupError) {
          console.log('Error removing parent message listener:', cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error');
        }
      }
      
      clearInterval(checkStorageInterval);
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [updateCart, toastApi]);
};

export default useCartMessageListener;
