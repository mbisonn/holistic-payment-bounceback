
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck } from 'lucide-react';
import { CartItem, CustomerInfo } from '@/utils/productUtils';
import { PAYMENT_ON_DELIVERY_URL } from '@/utils/paystackConfig';
import PaystackIntegration from '../PaystackIntegration';

interface PaymentOptionsProps {
  discountedTotal: number;
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  discountedTotal,
  customerInfo,
  cartItems,
  onSuccess,
  isLoading,
  setIsLoading
}) => {
  const handlePayOnDeliveryClick = () => {
    // Redirect to the user's specified URL for payment on delivery
    window.location.href = PAYMENT_ON_DELIVERY_URL;
  };

  return (
    <div className="space-y-5">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <PaystackIntegration
          amount={discountedTotal}
          email={customerInfo.email}
          customerInfo={customerInfo}
          cartItems={cartItems}
          onSuccess={onSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </motion.div>
      
      <div className="relative">
        <Separator className="my-6 bg-green-200" />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-50 px-3 text-sm text-green-600 font-medium">
          OR
        </span>
      </div>
      
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          className="w-full h-14 text-lg font-semibold border-2 border-green-600 text-green-700 hover:bg-green-50 lead-button"
          onClick={handlePayOnDeliveryClick} 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="loading-spinner"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Truck size={20} />
              Pay On Delivery Instead
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentOptions;
