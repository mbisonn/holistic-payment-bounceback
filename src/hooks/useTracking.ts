import { useEffect } from 'react';
import { initializeGTM, trackPurchaseEvent, trackBeginCheckout, trackAddToCart } from '@/utils/gtmUtils';
import { initializeFacebookPixel, trackFBPurchase, trackFBAddToCart, trackFBInitiateCheckout } from '@/utils/facebookPixelUtils';

export const useTracking = () => {
  useEffect(() => {
    // Initialize GTM
    initializeGTM();
    
    // Initialize Facebook Pixel (you'll need to set the pixel ID in settings)
    const pixelId = localStorage.getItem('fb_pixel_id');
    if (pixelId) {
      initializeFacebookPixel(pixelId);
    }
  }, []);

  const trackPurchase = (purchaseData: {
    transaction_id: string;
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    customer_data?: any;
  }) => {
    // Track with GTM/GA4
    trackPurchaseEvent(purchaseData);
    
    // Track with Facebook Pixel
    trackFBPurchase({
      value: purchaseData.value,
      currency: purchaseData.currency,
      content_ids: purchaseData.items.map(item => item.item_id),
      content_type: 'product',
      num_items: purchaseData.items.length
    });
  };

  const trackCheckoutBegin = (checkoutData: {
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    // Track with GTM/GA4
    trackBeginCheckout(checkoutData);
    
    // Track with Facebook Pixel
    trackFBInitiateCheckout({
      value: checkoutData.value,
      currency: checkoutData.currency,
      content_ids: checkoutData.items.map(item => item.item_id),
      content_type: 'product',
      num_items: checkoutData.items.length
    });
  };

  const trackCartAdd = (itemData: {
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
    value: number;
  }) => {
    // Track with GTM/GA4
    trackAddToCart(itemData);
    
    // Track with Facebook Pixel
    trackFBAddToCart({
      value: itemData.value,
      currency: 'NGN',
      content_ids: [itemData.item_id],
      content_type: 'product'
    });
  };

  const trackAbandonedCart = (cartData: {
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    // Track abandoned cart for remarketing
    if (window.gtag) {
      window.gtag('event', 'abandoned_cart', {
        currency: cartData.currency,
        value: cartData.value,
        items: cartData.items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }
  };

  return {
    trackPurchase,
    trackCheckoutBegin,
    trackCartAdd,
    trackAbandonedCart
  };
};