import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, X, CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/productUtils';
import PaystackPaymentProcessor from '@/components/payment/PaystackPaymentProcessor';
import OrderBumpsSection from '@/components/checkout/OrderBumpsSection';
import { CartItem } from '@/types/product-types';
import PaystackScriptLoader from '@/components/payment/PaystackScriptLoader';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutSection: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  // Create a simple updateCart function for OrderBumpsSection
  const updateCart = (newCart: CartItem[]) => {
    // This is a simplified approach - in a real app you'd want more sophisticated cart management
    console.log('Cart updated:', newCart);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add some products to get started.
        </p>
      </div>
    );
  }

  // Animated thank you banner
  const ThankYouBanner = () => (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="flex items-center gap-3 bg-green-600 text-white px-4 py-2 rounded-b-lg shadow-md mb-4 mx-auto w-full max-w-lg justify-center"
      >
        <CheckCircle className="h-6 w-6 text-white" />
        <span className="font-semibold text-base md:text-lg">Thank you for shopping with us!</span>
      </motion.div>
    </AnimatePresence>
  );

  if (showPayment) {
    return (
      <div className="space-y-6">
        <ThankYouBanner />
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-green-800">Complete Your Order</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowPayment(false)}
          >
            ← Back to Cart
          </Button>
        </div>
        <PaystackPaymentProcessor 
          cartItems={cart}
        />
      </div>
    );
  }

  return (
    <>
      <PaystackScriptLoader>{() => null}</PaystackScriptLoader>
      <ThankYouBanner />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-800">
              Your Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 object-cover rounded-md border"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-800">{formatCurrency(item.price)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-700">{formatCurrency(getTotal())}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowPayment(true)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold shadow-lg border-2 border-yellow-300"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-800"
              >
                Clear Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Bumps Section */}
        <OrderBumpsSection 
          cart={cart}
          updateCart={updateCart}
        />
      </div>
    </>
  );
};

export default CheckoutSection;
