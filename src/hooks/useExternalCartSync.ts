
import { useEffect, useCallback } from 'react';
import { CartItem } from '@/utils/productUtils';
import { productsCatalog } from '@/data/productsCatalog';

interface UseExternalCartSyncProps {
  updateCart: (items: CartItem[]) => void;
  onCartSynced?: (items: CartItem[]) => void;
}

export const useExternalCartSync = ({ updateCart, onCartSynced }: UseExternalCartSyncProps) => {
  
  const mapExternalItemsToInternal = useCallback((externalItems: any[]): CartItem[] => {
    console.log("[ExternalCartSync] Mapping external items:", externalItems);
    
    return externalItems.map(item => {
      // Find matching product by SKU
      const matchingProduct = productsCatalog.find(p => p.sku === item.sku);
      
      const mappedItem = {
        id: item.sku || item.id || `item-${Date.now()}`,
        sku: item.sku || item.id || 'unknown',
        name: item.name || matchingProduct?.name || 'Unknown Product',
        price: parseFloat(item.price) || matchingProduct?.price || 0,
        quantity: parseInt(item.quantity) || 1,
        image: matchingProduct?.image || `/images/${item.sku?.replace(/_/g, '-')}.jpg`
      };
      
      console.log("[ExternalCartSync] Mapped item:", mappedItem);
      return mappedItem;
    }).filter(item => item.sku && item.name && item.price > 0);
  }, []);

  const handleExternalCartData = useCallback((cartData: any) => {
    console.log("[ExternalCartSync] Processing cart data:", cartData);
    
    let cartItems: any[] = [];
    
    // Handle different data structures from your external script
    if (cartData.cartItems && Array.isArray(cartData.cartItems)) {
      cartItems = cartData.cartItems;
    } else if (cartData.items && Array.isArray(cartData.items)) {
      cartItems = cartData.items;
    } else if (cartData.cart && Array.isArray(cartData.cart)) {
      cartItems = cartData.cart;
    } else if (cartData.data?.cartItems && Array.isArray(cartData.data.cartItems)) {
      cartItems = cartData.data.cartItems;
    } else if (Array.isArray(cartData)) {
      cartItems = cartData;
    }
    
    console.log("[ExternalCartSync] Extracted cart items:", cartItems);
    
    if (cartItems.length > 0) {
      const mappedItems = mapExternalItemsToInternal(cartItems);
      
      if (mappedItems.length > 0) {
        console.log("[ExternalCartSync] Updating cart with mapped items:", mappedItems);
        updateCart(mappedItems);
        onCartSynced?.(mappedItems);
        
        // Send confirmation back to external script
        try {
          window.postMessage({
            type: 'CART_SYNC_CONFIRM',
            success: true,
            itemCount: mappedItems.length,
            timestamp: new Date().toISOString()
          }, '*');
          
          // Also try to send to parent window if in iframe
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'CART_SYNC_CONFIRM',
              success: true,
              itemCount: mappedItems.length,
              timestamp: new Date().toISOString()
            }, '*');
          }
        } catch (error) {
          console.error("[ExternalCartSync] Error sending confirmation:", error);
        }
      }
    }
  }, [updateCart, onCartSynced, mapExternalItemsToInternal]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;
      
      console.log("[ExternalCartSync] Received message:", event.data);
      
      switch (event.data.type) {
        case 'CART_DATA':
        case 'CART_SYNC':
          console.log("[ExternalCartSync] Processing CART_DATA/CART_SYNC");
          handleExternalCartData(event.data.cart || event.data.data || event.data);
          break;
          
        case 'CHECKOUT_INITIATED':
          console.log("[ExternalCartSync] Processing CHECKOUT_INITIATED");
          handleExternalCartData(event.data.cart || event.data.data || event.data);
          break;
          
        case 'ADD_TO_CART':
          console.log("[ExternalCartSync] Processing ADD_TO_CART");
          handleExternalCartData(event.data.payload || event.data.items || event.data);
          break;
          
        case 'CART_SYSTEM_READY':
          console.log("[ExternalCartSync] External system ready, sending ready signal back");
          try {
            window.postMessage({
              type: 'CART_READY',
              timestamp: new Date().toISOString()
            }, '*');
          } catch (error) {
            console.error("[ExternalCartSync] Error sending ready signal:", error);
          }
          break;
      }
    };

    // Listen for messages from external scripts
    window.addEventListener('message', handleMessage);
    
    // Enhanced storage checking with more keys and better error handling
    const storageKeys = [
      'teneraCart',
      'teneraCheckoutData',
      'systemeCart',
      'cart',
      'cartItems',
      'pendingOrderData',
      'checkoutData',
      'orderData'
    ];

    console.log("[ExternalCartSync] Starting localStorage monitoring for keys:", storageKeys);

    // Check localStorage immediately and periodically
    const checkStorageData = () => {
      try {
        storageKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data && data !== 'null' && data !== '[]') {
              try {
                const parsedData = JSON.parse(data);
                if (parsedData && ((parsedData.items && Array.isArray(parsedData.items)) || 
                    (parsedData.cartItems && Array.isArray(parsedData.cartItems)) || 
                    Array.isArray(parsedData))) {
                  console.log(`[ExternalCartSync] Found valid cart data in localStorage key: ${key}`, parsedData);
                  handleExternalCartData(parsedData);
                  // Clear the processed data to prevent reprocessing
                  localStorage.removeItem(key);
                }
              } catch (parseError) {
                console.error(`[ExternalCartSync] Error parsing data from ${key}:`, parseError);
              }
            }
          } catch (storageError) {
            console.error(`[ExternalCartSync] Error accessing localStorage key ${key}:`, storageError);
          }
        });
      } catch (error) {
        console.error("[ExternalCartSync] Error in storage check:", error);
      }
    };

    // Check storage immediately
    setTimeout(checkStorageData, 100);
    
    // Check storage every 2 seconds for new data
    const storageInterval = setInterval(checkStorageData, 2000);
    
    // Check URL parameters for cart data
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const cartParam = urlParams.get('cart');
      const dataParam = urlParams.get('data');
      const orderDataParam = urlParams.get('orderData');
      
      if (cartParam) {
        try {
          const cartData = JSON.parse(decodeURIComponent(cartParam));
          console.log("[ExternalCartSync] Found cart data in URL params:", cartData);
          handleExternalCartData(cartData);
        } catch (e) {
          console.error("[ExternalCartSync] Error parsing URL cart data:", e);
        }
      }
      
      if (dataParam) {
        try {
          const orderData = JSON.parse(decodeURIComponent(dataParam));
          console.log("[ExternalCartSync] Found order data in URL params:", orderData);
          handleExternalCartData(orderData);
        } catch (e) {
          console.error("[ExternalCartSync] Error parsing URL order data:", e);
        }
      }

      if (orderDataParam) {
        try {
          const orderData = JSON.parse(decodeURIComponent(orderDataParam));
          console.log("[ExternalCartSync] Found orderData in URL params:", orderData);
          handleExternalCartData(orderData);
        } catch (e) {
          console.error("[ExternalCartSync] Error parsing URL orderData:", e);
        }
      }
    } catch (urlError) {
      console.error("[ExternalCartSync] Error processing URL parameters:", urlError);
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(storageInterval);
    };
  }, [handleExternalCartData]);

  // Send ready signal on mount and periodically
  useEffect(() => {
    const sendReadySignal = () => {
      try {
        console.log("[ExternalCartSync] Sending CART_READY signal");
        
        // Send to current window
        window.postMessage({
          type: 'CART_READY',
          timestamp: new Date().toISOString()
        }, '*');
        
        // Also send to parent if in iframe
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'CART_READY',
            timestamp: new Date().toISOString()
          }, '*');
        }

        // Send additional ready signals with different types for compatibility
        const readyMessages = [
          { type: 'CART_SYSTEM_READY', timestamp: new Date().toISOString() },
          { type: 'TENERA_READY', timestamp: new Date().toISOString() },
          { type: 'CHECKOUT_READY', timestamp: new Date().toISOString() }
        ];

        readyMessages.forEach(msg => {
          window.postMessage(msg, '*');
          if (window.parent !== window) {
            window.parent.postMessage(msg, '*');
          }
        });

      } catch (error) {
        console.error("[ExternalCartSync] Error sending ready signal:", error);
      }
    };

    // Send ready signal immediately and then every 5 seconds
    sendReadySignal();
    const readyInterval = setInterval(sendReadySignal, 5000);
    
    return () => clearInterval(readyInterval);
  }, []);
};
