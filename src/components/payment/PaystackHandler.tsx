import { CartItem, CustomerInfo } from '@/utils/productUtils';
import { 
  PAYSTACK_PUBLIC_KEY, 
  MAKE_WEBHOOK_URL, 
  PAYSTACK_SUBACCOUNT,
  THANKYOU_PAGE_URL
} from '@/utils/paystackConfig';
import { trackPurchase, sendToMake } from '@/utils/analyticsUtils';
import { useEffect } from 'react';

interface PaystackHandlerProps {
  amount: number;
  email: string;
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  onSuccess: () => void;
  onClose?: () => void;
  scriptLoaded: boolean;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackHandler = (props: PaystackHandlerProps) => {
  const {
    amount,
    email,
    customerInfo,
    cartItems,
    onSuccess,
    onClose,
    scriptLoaded
  } = props;
  
  // Enhanced cart data checking with multiple sources
  useEffect(() => {
    try {
      const storageKeys = ['systemeCart', 'teneraCart', 'cartItems', 'checkoutData'];
      storageKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data && data !== 'null' && data !== '[]') {
          console.log(`Found ${key} data:`, JSON.parse(data));
        }
      });
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  }, []);

  const handlePaymentInitiation = (setIsLoading: (loading: boolean) => void) => {
    if (!scriptLoaded) {
      console.error('Paystack script not loaded yet');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      if (!window.PaystackPop) {
        console.error('PaystackPop not found in window object. Script may not be loaded properly.');
        setIsLoading(false);
        return;
      }

      // Validate required data
      if (!email || !customerInfo.name || cartItems.length === 0) {
        console.error('Missing required payment data:', { email, customerInfo, cartItems });
        setIsLoading(false);
        return;
      }

      console.log("Initializing enhanced Paystack payment with:", {
        email,
        amount: amount * 100,
        cartItemCount: cartItems.length,
        customerName: customerInfo.name,
        metadata: {
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          delivery_address: customerInfo.address,
          delivery_city: customerInfo.city,
          delivery_state: customerInfo.state,
          cart_items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', '),
          order_source: 'web_checkout',
          payment_method: 'card'
        }
      });

      const reference = `TENERA_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const metadata = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone || '',
        delivery_address: customerInfo.address || '',
        delivery_city: customerInfo.city || '',
        delivery_state: customerInfo.state || '',
        cart_items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', '),
        cart_count: cartItems.length,
        order_source: 'web_checkout',
        payment_method: 'card',
        timestamp: new Date().toISOString()
      };

      const paystackConfig = {
        key: PAYSTACK_PUBLIC_KEY,
        email: email.trim().toLowerCase(),
        amount: Math.round(amount * 100), // Ensure integer value in kobo
        currency: 'NGN',
        ref: reference,
        metadata,
        subaccount: PAYSTACK_SUBACCOUNT,
        callback: function(response: unknown) {
          console.log('Payment successful. Details:', {
            reference: (response as { reference: string }).reference,
            amount: amount,
            email: email,
            cartItems: cartItems.length
          });
          
          // Enhanced analytics tracking
          try {
            trackPurchase(
              cartItems,
              amount,
              (response as { reference: string }).reference,
              customerInfo
            );
          } catch (error) {
            console.error('Analytics tracking error:', error);
          }
          
          // Enhanced webhook data to Make.com
          try {
            sendToMake(
              cartItems,
              amount,
              (response as { reference: string }).reference,
              customerInfo,
              'card',
              MAKE_WEBHOOK_URL
            );
          } catch (error) {
            console.error('Webhook error:', error);
          }
          
          // Call success callback
          onSuccess();
          
          // Enhanced storage cleanup
          const storageKeys = [
            'systemeCart', 'teneraCart', 'cartItems', 'pendingOrderData',
            'checkoutData', 'cartSync', 'orderBumps', 'discountCode'
          ];
          storageKeys.forEach(key => {
            try {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            } catch (e) {
              console.warn(`Failed to clear ${key}:`, e);
            }
          });
          
          // Save customer data for upsells and future orders
          try {
            localStorage.setItem('customerEmail', email);
            localStorage.setItem('customerName', customerInfo.name);
            localStorage.setItem('lastPaymentReference', (response as { reference: string }).reference);
            localStorage.setItem('lastPaymentAmount', amount.toString());
            localStorage.setItem('lastPaymentDate', new Date().toISOString());
          } catch (error) {
            console.warn('Failed to save customer data:', error);
          }
          
          // Enhanced redirect with order confirmation - Updated to use user's specified URL
          setTimeout(() => {
            window.location.href = `${THANKYOU_PAGE_URL}?ref=${(response as { reference: string }).reference}&amount=${amount}`;
          }, 1000);
        },
        onClose: function() {
          console.log('Payment window closed by user');
          setIsLoading(false);
          if (onClose) {
            onClose();
          }
        },
        onError: function(error: unknown) {
          console.error('Payment error:', error);
          setIsLoading(false);
          if (onClose) {
            onClose();
          }
        }
      };
      
      console.log("Setting up enhanced Paystack with config:", {
        ...paystackConfig,
        key: paystackConfig.key.substring(0, 8) + '...' // Don't log full key
      });
      
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsLoading(false);
      if (onClose) {
        onClose();
      }
    }
  };

  return {
    handlePaymentInitiation
  };
};

export default PaystackHandler;
