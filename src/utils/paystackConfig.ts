
// Paystack configuration - PUBLIC KEYS ONLY
export const PAYSTACK_PUBLIC_KEY = "pk_live_4d0939de823de47bc4c580f73f30accbb2d39c89"; 

// Paystack subaccount code
export const PAYSTACK_SUBACCOUNT = "ACCT_0vs83gm7reeb99p"; 

// SECURITY FIX: Removed secret key - now handled securely in edge functions only

// Redirect URL after successful payment - Updated to user's specified URL
export const SUCCESS_REDIRECT_URL = "https://www.bouncebacktolifeconsult.pro/30c8b09c";

// Payment on delivery redirect URL - Updated to user's specified URL
export const PAYMENT_ON_DELIVERY_URL = "https://www.bouncebacktolifeconsult.pro/thank-you";

// API endpoint for verifying payment (would be implemented in a server)
export const VERIFY_PAYMENT_ENDPOINT = "/api/verify-payment";

// GTM & GA4 Events
export const GTM_EVENTS = {
  ADD_TO_CART: "add_to_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  VIEW_ITEM: "view_item",
  VIEW_CART: "view_cart",
};

// MakeAPI config (updated webhook URL)
export const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/obsfmmvumr12t7o3juyse32gbmdqn3pv";

// Enhanced upsell/downsell URLs with direct Paystack integration
export const UPSELL_URL = "https://www.bouncebacktolifeconsult.pro/30c8b09c";
export const DOWNSELL_URL = "https://www.bouncebacktolifeconsult.pro/30c8b09c";

// Enhanced Payment URLs for upsell/downsell - Direct to Paystack with proper redirect handling
export const UPSELL_PAYMENT_URL = "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/upsell?type=full&direct=true&redirect_to_paystack=true";
export const DOWNSELL_PAYMENT_URL = "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/upsell?type=lite&direct=true&redirect_to_paystack=true";

// API endpoints for cart data
export const CART_API_ENDPOINT = "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/sync-cart";

// Orders API endpoint
export const ORDERS_API_ENDPOINT = "https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/orders";

// Thankyou page URL - Updated to user's specified URL
export const THANKYOU_PAGE_URL = "https://www.bouncebacktolifeconsult.pro/30c8b09c";

// Order payment page URL - Updated to user's specified URL
export const ORDER_PAYMENT_URL = "https://www.bouncebacktolifeconsult.pro/30c8b09c";

// Project URL for integrations
export const PROJECT_URL = "https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com";

// Enhanced upsell/downsell configuration with proper Paystack integration
export const UPSELL_CONFIG = {
  full: {
    name: "Premium Wellness Package",
    price: 50000, // ₦500
    description: "Complete wellness solution with all premium products",
    paymentUrl: UPSELL_PAYMENT_URL,
    paystackUrl: `https://paystack.com/pay/premium-wellness-package`,
    thankYouRedirect: THANKYOU_PAGE_URL
  },
  lite: {
    name: "Essential Wellness Package", 
    price: 15000, // ₦150
    description: "Essential wellness products for daily health",
    paymentUrl: DOWNSELL_PAYMENT_URL,
    paystackUrl: `https://paystack.com/pay/essential-wellness-package`,
    thankYouRedirect: THANKYOU_PAGE_URL
  }
};

// Enhanced function to generate upsell/downsell payment links
export const generateUpsellPaymentLink = (type: 'full' | 'lite', customerEmail?: string, customerName?: string) => {
  const config = UPSELL_CONFIG[type];
  const baseUrl = type === 'full' ? UPSELL_PAYMENT_URL : DOWNSELL_PAYMENT_URL;
  
  const params = new URLSearchParams({
    type,
    direct: 'true',
    redirect_to_paystack: 'true',
    amount: config.price.toString(),
    currency: 'NGN',
    callback_url: encodeURIComponent(config.thankYouRedirect),
    ...(customerEmail && { email: customerEmail }),
    ...(customerName && { name: customerName })
  });
  
  return `${baseUrl}&${params.toString()}`;
};
