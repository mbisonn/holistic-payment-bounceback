
/**
 * Configuration settings for Tenera sales page integration
 */

export const CONFIG = {
  ORDER_PAYMENT_REDIRECT: "https://www.teneraholisticandwellness.com/order-payment",
  ORDERS_API: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
  CHECKOUT_APP_URL: "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com",
  DEBUG: true,
  
  // Allowed origins for secure message communication
  ALLOWED_ORIGINS: [
    'https://www.teneraholisticandwellness.com',
    'https://teneraholisticandwellness.com',
    'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
    'https://holistic-payment-hub-63.lovable.app',
    'https://holistic-payment-hub.lovable.app',
    'http://localhost',
    '*' // Allow all origins temporarily to help debug
  ]
};
