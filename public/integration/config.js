
/**
 * Configuration settings for Tenera Landing Page Integration
 */

export const CONFIG = {
  API_ENDPOINT: "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/orders",
  ORDER_PAYMENT_URL: "https://www.teneraholisticandwellness.com/order-payment",
  STORAGE_KEYS: {
    PRIMARY: "systemeCart",
    SECONDARY: ["cart", "cartItems", "teneraCart"]
  },
  DEBUG: true
};

