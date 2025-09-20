
import { useEffect } from 'react';
import { CartItem } from '@/types/product-types';
import { ToastAPI } from '@/types/toast-types';
import { loadCartFromStorage } from '@/utils/cart/cartStorageUtils';
import { CartUrlHandler } from '@/utils/cartUrlHandler';
import { sendReadyMessage } from '@/utils/cartMessageHandler';

export const useCartInitializer = (
  updateCart: (items: CartItem[]) => void,
  toastApi: ToastAPI,
  isInitialLoad: React.MutableRefObject<boolean>
) => {
  useEffect(() => {
    if (!isInitialLoad.current) return;
    
    console.log("CartInitializer - Loading cart data on initial load");
    
    // Send ready message immediately and periodically for external systems
    sendReadyMessage();
    const readyInterval = setInterval(sendReadyMessage, 2000);
    
    // Check URL parameters first (highest priority for external checkout)
    const urlCartItems = CartUrlHandler.parseCartFromUrl();
    if (urlCartItems.length > 0) {
      console.log("CartInitializer - Found cart data in URL, loading", urlCartItems.length, "items");
      updateCart(urlCartItems);
      localStorage.setItem('externalCheckoutMode', 'true');
      toastApi.toast({
        title: "Cart Loaded! 🎉",
        description: `${urlCartItems.length} items loaded from checkout data`
      });
      
      // Clean up URL after loading
      CartUrlHandler.clearCartFromUrl();
      isInitialLoad.current = false;
      clearInterval(readyInterval);
      return;
    }

    // Check for customer info in URL params (from external checkout)
    const urlParams = new URLSearchParams(window.location.search);
    const customerInfoParam = urlParams.get('customerInfo');
    if (customerInfoParam) {
      try {
        const customerInfo = JSON.parse(decodeURIComponent(customerInfoParam));
        localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
        console.log("CartInitializer - Loaded customer info from URL");
      } catch (e) {
        console.error("Error parsing customer info from URL:", e);
      }
    }

    // Check storage for existing cart data using updated storage utility
    const { items: storageItems, source } = loadCartFromStorage();
    if (storageItems.length > 0) {
      console.log(`CartInitializer - Loaded ${storageItems.length} items from ${source}`);
      updateCart(storageItems);
      
      // Set external mode flag if cart came from external sources
      if (['TENERA_CART_UPDATE', 'teneraCart', 'TeneraShoppingCart', 'systemeCart'].includes(source)) {
        localStorage.setItem('externalCheckoutMode', 'true');
      }
      
      toastApi.toast({
        title: "Cart Restored! 📦",
        description: `${storageItems.length} items restored from ${source === 'TENERA_CART_UPDATE' ? 'website sync' : 'previous session'}`
      });
    }

    // Check for external checkout mode indicators
    const checkExternalMode = () => {
      const hasExternalData = localStorage.getItem('TeneraShoppingCart') || 
                             localStorage.getItem('systemeCart') ||
                             localStorage.getItem('teneraCart') ||
                             localStorage.getItem('TENERA_CART_UPDATE');
      
      if (hasExternalData) {
        localStorage.setItem('externalCheckoutMode', 'true');
      }
    };
    
    checkExternalMode();
    
    isInitialLoad.current = false;
    
    // Clean up interval after initial load
    setTimeout(() => {
      clearInterval(readyInterval);
    }, 10000); // Stop sending ready messages after 10 seconds
    
  }, [updateCart, toastApi, isInitialLoad]);
};
