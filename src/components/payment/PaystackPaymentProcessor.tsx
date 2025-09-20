
import React from 'react';
import TwoStepPaymentForm from './TwoStepPaymentForm';

interface PaystackPaymentProcessorProps {
  cartItems: any[];
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
  };
}

const PaystackPaymentProcessor: React.FC<PaystackPaymentProcessorProps> = ({
  cartItems
}) => {
  // Calculate total in Naira
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  };

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    // Clear cart and redirect to success page
    localStorage.removeItem('teneraCart');
    localStorage.removeItem('systemeCart');
    window.location.href = 'https://www.teneraholisticandwellness.com/thankyoupage';
  };

  return (
    <TwoStepPaymentForm
      cartItems={cartItems}
      calculateTotal={calculateTotal}
      onSuccess={handlePaymentSuccess}
    />
  );
};

export default PaystackPaymentProcessor;
