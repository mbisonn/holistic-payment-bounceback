
import React from 'react';
import { motion } from 'framer-motion';
import PaystackPaymentProcessor from '@/components/payment/PaystackPaymentProcessor';
import { CartItem } from '@/types/product-types';

interface PaymentSectionProps {
  cart: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
  };
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ cart, customerInfo }) => {
  if (cart.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-12 bg-gradient-to-b from-green-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            Complete Your Order
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Secure payment processing with Paystack. Pay in Nigerian Naira (₦) 
            for your wellness products.
          </p>
        </div>
        
        <div className="flex justify-center">
          <PaystackPaymentProcessor 
            cartItems={cart}
            customerInfo={customerInfo}
          />
        </div>
      </div>
    </motion.section>
  );
};

export default PaymentSection;
