
// Google Tag Manager and GA4 integration utilities
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize GTM with the provided ID
export const initializeGTM = (gtmId?: string) => {
  if (typeof window === 'undefined') return;

  const finalGtmId = gtmId || 'GTM-MQ6HKDRG';

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  console.log('GTM initialized with ID:', finalGtmId);
};

// Enhanced purchase tracking with GA4 recommended events
export const trackPurchaseEvent = (transactionData: {
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
  customer_data?: {
    email?: string;
    phone?: string;
    address?: any;
  };
}) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  // GA4 Enhanced Ecommerce Purchase Event
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionData.transaction_id,
      value: transactionData.value,
      currency: transactionData.currency,
      items: transactionData.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      }))
    },
    user_data: transactionData.customer_data
  });

  console.log('Purchase event tracked:', transactionData);
};

// Track begin_checkout event
export const trackBeginCheckout = (cartData: {
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
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: cartData.currency,
      value: cartData.value,
      items: cartData.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      }))
    }
  });

  console.log('Begin checkout event tracked:', cartData);
};

// Track add_to_cart event
export const trackAddToCart = (item: {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
  value: number;
}) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'NGN',
      value: item.value,
      items: [{
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      }]
    }
  });

  console.log('Add to cart event tracked:', item);
};

// Track view_item event
export const trackViewItem = (item: {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
}) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'view_item',
    ecommerce: {
      currency: 'NGN',
      value: item.price,
      items: [{
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        price: item.price,
      }]
    }
  });

  console.log('View item event tracked:', item);
};

// Track form submissions
export const trackFormSubmission = (formType: string, formData?: any) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'generate_lead',
    form_type: formType,
    form_data: formData
  });

  console.log('Form submission tracked:', { formType, formData });
};
