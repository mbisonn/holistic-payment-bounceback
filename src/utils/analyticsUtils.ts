
import { CartItem } from '@/types/product-types';
import { CustomerInfo, formatCurrency } from './productUtils';

// Initialize Google Tag Manager
export const initializeGTM = () => {
  try {
    console.log('Initializing Google Tag Manager');
    
    // This would typically contain the GTM initialization code
    // For now, we're just logging to console
    
    // Example of what a real implementation might look like:
    // (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    // })(window,document,'script','dataLayer','GTM-XXXXXX');
  } catch (error) {
    console.error('Error initializing GTM:', error);
  }
};

// Track purchase event for analytics
export const trackPurchase = (
  cartItems: CartItem[],
  total: number,
  transactionId: string,
  customerInfo: CustomerInfo
) => {
  try {
    console.log(`Purchase tracked: ${transactionId} - ${formatCurrency(total)}`);
    
    // Track additional details for debugging
    console.log('Customer:', customerInfo);
    console.log('Items:', cartItems);
    
    // Here you would typically call an analytics service
    // For now, we're just logging to console
  } catch (error) {
    console.error('Error tracking purchase:', error);
  }
};

// Track begin checkout event
export const trackBeginCheckout = (
  cartItems: CartItem[],
  total: number
) => {
  try {
    console.log(`Checkout begun: ${formatCurrency(total)}`);
    console.log('Items:', cartItems);
    
    // Here you would typically call an analytics service
  } catch (error) {
    console.error('Error tracking checkout:', error);
  }
};

// Send order data to Make.com webhook
export const sendToMake = async (
  cartItems: CartItem[],
  total: number,
  reference: string,
  customerInfo: CustomerInfo,
  paymentMethod: string,
  webhookUrl: string
) => {
  try {
    const payload = {
      reference,
      items: cartItems,
      total,
      customer: customerInfo,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending data to webhook:', payload);
    
    // Send data to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Webhook response:', result);
    
    return result;
  } catch (error) {
    console.error('Error sending data to webhook:', error);
    throw error; // Re-throw to let calling code handle it
  }
};
