
// Facebook Pixel integration utilities
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Initialize Facebook Pixel
export const initializeFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Facebook Pixel Code
  const fbScript = document.createElement('script');
  fbScript.innerHTML = `
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
  `;
  document.head.appendChild(fbScript);

  // Add noscript pixel
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
  document.body.appendChild(noscript);

  console.log('Facebook Pixel initialized with ID:', pixelId);
};

// Track Facebook Pixel events
export const trackFBPixelEvent = (eventName: string, eventData?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
    console.log('FB Pixel event tracked:', eventName, eventData);
  }
};

// Track purchase event
export const trackFBPurchase = (purchaseData: {
  value: number;
  currency: string;
  content_ids: string[];
  content_type: string;
  num_items: number;
}) => {
  trackFBPixelEvent('Purchase', {
    value: purchaseData.value,
    currency: purchaseData.currency,
    content_ids: purchaseData.content_ids,
    content_type: purchaseData.content_type,
    num_items: purchaseData.num_items
  });
};

// Track add to cart event
export const trackFBAddToCart = (cartData: {
  value: number;
  currency: string;
  content_ids: string[];
  content_type: string;
}) => {
  trackFBPixelEvent('AddToCart', {
    value: cartData.value,
    currency: cartData.currency,
    content_ids: cartData.content_ids,
    content_type: cartData.content_type
  });
};

// Track checkout initiation
export const trackFBInitiateCheckout = (checkoutData: {
  value: number;
  currency: string;
  content_ids: string[];
  content_type: string;
  num_items: number;
}) => {
  trackFBPixelEvent('InitiateCheckout', {
    value: checkoutData.value,
    currency: checkoutData.currency,
    content_ids: checkoutData.content_ids,
    content_type: checkoutData.content_type,
    num_items: checkoutData.num_items
  });
};

// Track lead generation (form submissions)
export const trackFBLead = (leadData?: {
  content_name?: string;
  value?: number;
  currency?: string;
}) => {
  trackFBPixelEvent('Lead', leadData);
};
