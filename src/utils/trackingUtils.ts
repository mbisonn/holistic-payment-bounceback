import { CartItem } from '@/types/product-types';

// Meta Pixel and GTM tracking utilities

// Initialize Meta Pixel
export const initializeMetaPixel = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    return; // Already initialized
  }

  // Meta Pixel initialization is already done in index.html
  console.log('Meta Pixel initialized');
};

// Initialize Google Tag Manager
export const initializeGTM = () => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    console.log('GTM already initialized');
    return; // Already initialized
  }

  // GTM initialization is already done in index.html
  console.log('GTM initialized');
};

// Track Meta Pixel events
export const trackMetaPixelEvent = (eventName: string, eventData?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
  }
};

// Track GTM events
export const trackGTMEvent = (eventName: string, eventData?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  }
};

// E-commerce tracking functions
export const trackFormSubmission = (formType: string, formData?: Record<string, unknown>) => {
  // Meta Pixel
  trackMetaPixelEvent('Lead', {
    content_name: formType,
    value: 0,
    currency: 'NGN'
  });

  // GTM
  trackGTMEvent('generate_lead', {
    event_category: 'engagement',
    event_label: formType,
    form_data: formData
  });
};

export const trackPurchaseEvent = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: CartItem[];
}) => {
  // Meta Pixel
  trackMetaPixelEvent('Purchase', {
    value: transactionData.value,
    currency: transactionData.currency,
    content_ids: transactionData.items.map(item => item.id),
    content_type: 'product'
  });

  // GTM
  trackGTMEvent('purchase', {
    transaction_id: transactionData.transaction_id,
    value: transactionData.value,
    currency: transactionData.currency,
    items: transactionData.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: 'wellness_products',
      quantity: item.quantity,
      price: item.price
    }))
  });
};

export const trackBeginCheckout = (cartData: {
  value: number;
  currency: string;
  items: CartItem[];
}) => {
  // Meta Pixel
  trackMetaPixelEvent('InitiateCheckout', {
    value: cartData.value,
    currency: cartData.currency,
    content_ids: cartData.items.map(item => item.id),
    content_type: 'product',
    num_items: cartData.items.length
  });

  // GTM
  trackGTMEvent('begin_checkout', {
    currency: cartData.currency,
    value: cartData.value,
    items: cartData.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: 'wellness_products',
      quantity: item.quantity,
      price: item.price
    }))
  });
};

export const trackAddToCart = (item: CartItem) => {
  // Meta Pixel
  trackMetaPixelEvent('AddToCart', {
    value: item.price * item.quantity,
    currency: 'NGN',
    content_ids: [item.id],
    content_type: 'product'
  });

  // GTM
  trackGTMEvent('add_to_cart', {
    currency: 'NGN',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      category: 'wellness_products',
      quantity: item.quantity,
      price: item.price
    }]
  });
};

// Declare global types for TypeScript
declare global {
  interface Window {
    fbq: any;
    dataLayer: any[];
  }
}
