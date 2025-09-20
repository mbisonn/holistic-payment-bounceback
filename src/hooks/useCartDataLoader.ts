
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ToastAPI } from '@/types/toast-types';
import { loadCartFromStorage, saveCartToAllStorages } from '@/utils/cart/cartStorageUtils';
import { validateCartItems } from '@/utils/cart/cartValidationUtils';

/**
 * Hook for loading cart data from various sources
 */
export const useCartDataLoader = (toast: ToastAPI) => {
  const { updateCart } = useCart();

  useEffect(() => {
    const loadCartData = async () => {
      try {
        console.log("CartDataLoader - Starting cart data initialization");
        let cartLoaded = false;
        
        // Try URL parameters first since they're highest priority (they come direct from the landing page)
        const urlParams = new URLSearchParams(window.location.search);
        const cartParam = urlParams.get('cart');
        
        if (cartParam) {
          try {
            console.log("CartDataLoader - Found cart parameter in URL");
            const decodedCartParam = decodeURIComponent(cartParam);
            console.log("CartDataLoader - Decoded cart parameter:", decodedCartParam.substring(0, 100) + "...");
            
            const cartItems = JSON.parse(decodedCartParam);
            
            if (Array.isArray(cartItems) && cartItems.length > 0) {
              console.log("CartDataLoader - Valid cart items in URL parameter:", cartItems);
              
              // Validate and normalize the cart items
              const validation = validateCartItems(cartItems);
              
              if (validation.isValid && validation.items.length > 0) {
                console.log("CartDataLoader - Validated items:", validation.items);
                
                // Save to all storage mechanisms before updating cart
                saveCartToAllStorages(validation.items);
                
                // Update cart state
                updateCart(validation.items);
                cartLoaded = true;
                
                toast.toast({
                  title: "Cart Loaded",
                  description: `${validation.items.length} item(s) loaded from URL`
                });
                
                // Clean the URL after loading to avoid issues with cart reloading
                // but preserve the redirect parameters
                if (window.history && window.history.replaceState) {
                  // Keep any other parameters except cart
                  const params = new URLSearchParams(window.location.search);
                  params.delete('cart');
                  
                  let cleanUrl = window.location.pathname;
                  if (params.toString()) {
                    cleanUrl += '?' + params.toString();
                  }
                  
                  window.history.replaceState({}, document.title, cleanUrl);
                  console.log("CartDataLoader - Cleaned URL parameters");
                }
                
                // Check if we need to redirect (for embedded mode)
                const shouldRedirect = urlParams.get('redirect') === 'true';
                const redirectUrl = urlParams.get('redirectUrl');
                
                if (shouldRedirect && redirectUrl) {
                  console.log(`CartDataLoader - Will redirect to ${redirectUrl}`);
                  setTimeout(() => {
                    window.location.href = redirectUrl;
                  }, 1500); // Short delay to allow the UI to update
                }
                
                return; // Exit after loading from URL
              } else {
                console.warn("CartDataLoader - No valid items after validation");
              }
            } else {
              console.warn("CartDataLoader - Invalid cart data format in URL");
            }
          } catch (e) {
            console.error("Error parsing cart from URL:", e);
          }
        } else {
          console.log("CartDataLoader - No cart parameter found in URL");
        }
        
        // If we didn't load from URL params, try to load from storage
        if (!cartLoaded) {
          const { items, source } = loadCartFromStorage();
          
          if (items && items.length > 0) {
            console.log(`CartDataLoader - Found ${items.length} items from ${source}`);
            updateCart(items);
            cartLoaded = true;
            
            toast.toast({
              title: "Cart Loaded",
              description: `${items.length} item(s) loaded successfully from ${source}`
            });
          }
        }
        
        if (!cartLoaded) {
          console.log("CartDataLoader - No cart data found from any source");
        }
      } catch (error) {
        console.error("CartDataLoader - Error loading cart data:", error);
      }
    };
    
    loadCartData();
  }, [updateCart, toast]);
  
  // Listen for visibility changes - reload cart when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("CartDataLoader - Page became visible, checking for new cart data");
        const { items, source } = loadCartFromStorage();
        
        if (items && items.length > 0) {
          console.log(`CartDataLoader - Found ${items.length} items from ${source} on visibility change`);
          updateCart(items);
          
          toast.toast({
            title: "Cart Updated",
            description: `${items.length} item(s) loaded on page return`
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateCart, toast]);
};

export default useCartDataLoader;
