
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, CartItem } from '@/utils/productUtils';
import OrderBumpsSection from '@/components/checkout/OrderBumpsSection';
import PaystackPaymentProcessor from '@/components/payment/PaystackPaymentProcessor';

interface OrderCompleteSectionProps {
  cartItems: CartItem[];
  updateCart: (items: CartItem[]) => void;
}

const OrderCompleteSection = ({ cartItems, updateCart }: OrderCompleteSectionProps) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Order</CardTitle>
          <CardDescription className="text-white/80 text-center">
            Review your items and proceed to secure checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cart Items Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/20">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-white/70">Quantity: {item.quantity}</p>
                </div>
                <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
            
            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-white/30">
              <span>Total:</span>
              <span className="text-green-400">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Processor */}
          <PaystackPaymentProcessor cartItems={cartItems} />
        </CardContent>
      </Card>

      {/* Order Bumps Section */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Special Offers</CardTitle>
          <CardDescription className="text-white/80">
            Add these items to enhance your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderBumpsSection 
            cart={cartItems}
            updateCart={updateCart}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderCompleteSection;
