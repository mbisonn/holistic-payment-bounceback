import { 
  PAYSTACK_PUBLIC_KEY, 
  PAYSTACK_SUBACCOUNT,
  THANKYOU_PAGE_URL
} from '@/utils/paystackConfig';
import { trackPurchase } from '@/utils/analyticsUtils';
import { useEffect } from 'react';
import { CartItem, CustomerInfo } from '@/utils/productUtils';

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
  
  // Check for existing cart data from the landing page
  useEffect(() => {
    try {
      const externalCart = localStorage.getItem('systemeCart');
      if (externalCart) {
        console.log("Found external cart data:", JSON.parse(externalCart));
      }
    } catch (error) {
      console.error("Error loading external cart:", error);
    }
  }, []);

  const handlePaymentInitiation = (setIsLoading: (loading: boolean) => void) => {
    if (!scriptLoaded) {
      console.error('Paystack script not loaded yet');
      return;
    }

    setIsLoading(true);

    try {
      if (!window.PaystackPop) {
        console.error('PaystackPop not found in window object. Script may not be loaded properly.');
        setIsLoading(false);
        return;
      }

      console.log("Initializing Paystack payment with:", {
        email,
        amount: amount * 100,
        metadata: {
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          delivery_address: customerInfo.address,
          delivery_city: customerInfo.city,
          delivery_state: customerInfo.state,
          cart_items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', ')
        }
      });

      const reference = `TENERA_${Math.floor(Math.random() * 1000000000 + 1)}`;

      const metadata = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        delivery_address: customerInfo.address,
        delivery_city: customerInfo.city,
        delivery_state: customerInfo.state,
        cart_items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', ')
      };

      const paystackConfig = {
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100,
        currency: 'NGN',
        ref: reference,
        metadata,
        subaccount: PAYSTACK_SUBACCOUNT,
        callback: function(response: unknown) {
          console.log('Payment successful. Reference:', (response as { reference: string }).reference);
          
          // Track purchase event
          trackPurchase(
            cartItems,
            amount,
            (response as { reference: string }).reference,
            customerInfo
          );
          
          // Call onSuccess callback
          onSuccess();
          
          // Clear external cart data
          const storageKeys = ['systemeCart', 'teneraCart', 'cartItems', 'pendingOrderData'];
          storageKeys.forEach(key => {
            try {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            } catch (e) {
              console.warn(`Failed to clear ${key}:`, e);
            }
          });
          
          // Save customer email for potential upsells
          localStorage.setItem('customerEmail', email);
          localStorage.setItem('lastPaymentReference', (response as { reference: string }).reference);
          
          // Redirect to thank you page
          window.location.href = THANKYOU_PAGE_URL;
        },
        onClose: function() {
          console.log('Payment window closed');
          setIsLoading(false);
          if (onClose) {
            onClose();
          }
        }
      };
      
      console.log("Setting up Paystack with config:", paystackConfig);
      
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsLoading(false);
    }
  };

  return {
    handlePaymentInitiation
  };
};

export default PaystackHandler;
