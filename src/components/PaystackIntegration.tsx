
import React from 'react';
import PaymentButton from './payment/PaymentButton';
import PaystackScriptLoader from './payment/PaystackScriptLoader';
import PaystackHandler from './payment/PaystackHandler';
import { CartItem, CustomerInfo } from '@/utils/productUtils';

interface PaystackButtonProps {
  amount: number;
  email: string;
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  onSuccess: () => void;
  onClose?: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Define the type for the handler object returned by PaystackHandler
interface PaystackHandlerObject {
  handlePaymentInitiation: (setIsLoading: (loading: boolean) => void) => void;
}

const PaystackIntegration: React.FC<PaystackButtonProps> = ({
  amount,
  email,
  customerInfo,
  cartItems,
  onSuccess,
  onClose,
  isLoading,
  setIsLoading
}) => {
  return (
    <PaystackScriptLoader>
      {(scriptLoaded) => {
        // Explicitly type the handler as PaystackHandlerObject
        const handler: PaystackHandlerObject = PaystackHandler({
          amount,
          email,
          customerInfo,
          cartItems,
          onSuccess,
          onClose,
          scriptLoaded
        });
        
        const handlePayment = () => {
          handler.handlePaymentInitiation(setIsLoading);
        };

        return (
          <PaymentButton 
            onClick={handlePayment} 
            isLoading={isLoading || !scriptLoaded} 
          />
        );
      }}
    </PaystackScriptLoader>
  );
};

export default PaystackIntegration;
