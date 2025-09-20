
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for loading cart data from various sources on the homepage
 */
export const useCartLoader = () => {
  const { cart, updateCart } = useCart();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadCartData = async () => {
      try {
        setIsLoading(true);
        console.log("HomePage - Starting cart data initialization");
        
        const cartSources = ['systemeCart', 'cart', 'cartItems', 'teneraCart'];
        let cartData = null;
        
        for (const source of cartSources) {
          const storedData = localStorage.getItem(source);
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`Found cart data in ${source}:`, parsedData);
                cartData = parsedData;
                break;
              }
            } catch (e) {
              console.error(`Error parsing ${source}:`, e);
            }
          }
        }
        
        if (!cartData) {
          const urlParams = new URLSearchParams(window.location.search);
          const cartParam = urlParams.get('cart');
          if (cartParam) {
            try {
              const decodedCart = JSON.parse(decodeURIComponent(cartParam));
              console.log("Found cart data in URL:", decodedCart);
              if (Array.isArray(decodedCart) && decodedCart.length > 0) {
                cartData = decodedCart;
              }
            } catch (e) {
              console.error("Error parsing cart from URL:", e);
            }
          }
        }
        
        if (!cartData) {
          try {
            const { data: recentOrder, error } = await supabase
              .from('orders')
              .select('id, created_at, total_amount')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (!error && recentOrder && recentOrder.created_at) {
              console.log("Found recent order in database:", recentOrder);
              
              const orderTime = new Date(recentOrder.created_at).getTime();
              const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
              
              if (orderTime > thirtyMinutesAgo) {
                // For now, we'll create a simple cart item based on the order
                // In a real scenario, you'd want to fetch the actual order items
                cartData = [{
                  id: recentOrder.id,
                  name: 'Recent Order Item',
                  price: recentOrder.total_amount || 0,
                  quantity: 1
                }];
              }
            }
          } catch (e) {
            console.error("Error fetching recent order:", e);
          }
        }
        
        if (cartData && Array.isArray(cartData)) {
          console.log("Updating cart with data:", cartData);
          updateCart(cartData);
          
          const cartString = JSON.stringify(cartData);
          localStorage.setItem('systemeCart', cartString);
          localStorage.setItem('cart', cartString);
          localStorage.setItem('cartItems', cartString);
          localStorage.setItem('teneraCart', cartString);
          
          toast({
            title: "Cart Updated",
            description: `${cartData.length} item(s) loaded successfully`,
          });
        } else {
          console.log("No cart data found");
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadCartData();
  }, [updateCart, toast]);

  // Message handler for cart updates via postMessage
  useEffect(() => {
    const handleExternalMessage = (event: MessageEvent) => {
      console.log("Received external message:", event);
      
      if (event.data && event.data.type === 'CART_DATA' && Array.isArray(event.data.cart)) {
        console.log("Processing cart data from postMessage:", event.data.cart);
        updateCart(event.data.cart);
        
        const cartString = JSON.stringify(event.data.cart);
        localStorage.setItem('systemeCart', cartString);
        localStorage.setItem('cart', cartString);
        localStorage.setItem('cartItems', cartString);
        localStorage.setItem('teneraCart', cartString);
        
        toast({
          title: "Cart Updated",
          description: `${event.data.cart.length} item(s) received from external source`,
        });
      }
    };
    
    window.addEventListener('message', handleExternalMessage);
    
    return () => {
      window.removeEventListener('message', handleExternalMessage);
    };
  }, [updateCart, toast]);

  return { isLoading, isInitialized, cart };
};

export default useCartLoader;
