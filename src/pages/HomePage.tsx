import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, CreditCard, Truck, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiscountCode } from '@/types/product-types';
import { useCart } from '@/contexts/CartContext';
import DiscountCodeInput from '@/components/home/DiscountCodeInput';
import HomeHeader from '@/components/home/HomeHeader';
import HomeFooter from '@/components/home/HomeFooter';
import CustomerInfoSection from '@/components/home/CustomerInfoSection';
import CartSection from '@/components/home/CartSection';
import OrderBumpsSection from '@/components/checkout/OrderBumpsSection';
import GlassPrismBackground from '@/components/home/GlassPrismBackground';
import { calculateCartTotals } from '@/utils/cartTotalsUtils';
import { getShippingFee } from '@/utils/shippingManager';

const HomePage = () => {
  const { cart, setCart, updateQuantity, removeFromCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    lga: '',
    state: '',
    country: 'Nigeria',
  });
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [shippingFee, setShippingFee] = useState(2000);
  const [productSubtotal, setProductSubtotal] = useState(0);
  const [orderBumpTotal, setOrderBumpTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const calculateTotals = async () => {
      const { productSubtotal: subtotal, orderBumpTotal: bumpTotal } = calculateCartTotals(cart);
      setProductSubtotal(subtotal);
      setOrderBumpTotal(bumpTotal);

      const discounted = discountCode ? (subtotal + bumpTotal) * (1 - discountCode.value / 100) : subtotal + bumpTotal;
      setDiscountedTotal(discounted);

      const fee = await getShippingFee(customerInfo.state, [discounted]);
      setShippingFee(fee);

      setFinalTotal(discounted + fee);
    };

    calculateTotals();
  }, [cart, discountCode, customerInfo.state]);

  const updateCustomerInfo = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    // Mock discount code validation
    if (code === 'TENERA10') {
      setDiscountCode({
        id: 'mocked',
        code: 'TENERA10',
        type: 'percentage',
        value: 10,
        max_uses: 100,
        current_uses: 10,
        is_active: true,
        expires_at: null,
        created_at: new Date().toISOString()
      });
    } else {
      alert('Invalid discount code');
      setDiscountCode(null);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode(null);
    setDiscountInput('');
  };

  const handleCheckout = () => {
    // Store customer info and cart data for Paystack
    localStorage.setItem('checkoutData', JSON.stringify({
      customerInfo,
      cart,
      totalAmount: finalTotal
    }));
    
    // Redirect to Paystack checkout
    window.location.href = 'https://www.bouncebacktolifeconsult.pro/30c8b09c';
  };

  const handlePayOnDelivery = () => {
    // Store order data for tracking
    localStorage.setItem('orderData', JSON.stringify({
      customerInfo,
      cart,
      totalAmount: finalTotal,
      paymentMethod: 'pay_on_delivery'
    }));
    
    window.location.href = 'https://www.bouncebacktolifeconsult.pro/30c8b09c';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      <GlassPrismBackground />
      
      <div className="relative z-10">
        <HomeHeader />
        
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 max-w-7xl mx-auto">
            {/* Left Column - Customer Info */}
            <div className="space-y-6 sm:space-y-8">
              <CustomerInfoSection 
                customerInfo={customerInfo}
                updateCustomerInfo={updateCustomerInfo}
              />
            </div>

            {/* Right Column - Discount, Cart, Special Offers, Payment */}
            <div className="space-y-6 sm:space-y-8">
              {/* Discount Code Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Tag className="h-5 w-5" />
                      Discount Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DiscountCodeInput
                      discountInput={discountInput}
                      setDiscountInput={setDiscountInput}
                      handleApplyDiscount={handleApplyDiscount}
                      handleRemoveDiscount={handleRemoveDiscount}
                      discountCode={discountCode}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cart Section */}
              <div className="overflow-x-auto rounded-lg">
                <CartSection
                  cart={cart}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  updateCart={setCart}
                  discount={{
                    code: discountCode?.code || '',
                    discountCode,
                    discountInput,
                    setDiscountInput,
                    handleApplyDiscount,
                    handleRemoveDiscount
                  }}
                  shippingFee={shippingFee}
                  showShipping={true}
                  orderBumpTotal={orderBumpTotal}
                  productSubtotal={productSubtotal}
                  discountedTotal={discountedTotal}
                  finalTotal={finalTotal}
                />
              </div>

              {/* Special Offers */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Gift className="h-5 w-5" />
                      Special Offers Just For You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderBumpsSection 
                      cart={cart} 
                      updateCart={setCart} 
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-4 md:py-6 text-lg md:text-xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 hover:from-purple-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl border border-white/20"
                    disabled={!customerInfo.name || !customerInfo.email}
                  >
                    <CreditCard className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                    Continue to Secure Payment
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handlePayOnDelivery}
                    variant="outline"
                    className="w-full py-4 md:py-6 text-lg md:text-xl font-bold border-2 border-purple-400 text-purple-300 hover:bg-purple-400/20 backdrop-blur-sm rounded-2xl shadow-lg"
                    disabled={!customerInfo.name || !customerInfo.email}
                  >
                    <Truck className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                    Pay On Delivery
                  </Button>
                </motion.div>

                {(!customerInfo.name || !customerInfo.email) && (
                  <motion.p 
                    className="text-white/60 text-base md:text-lg text-center mt-4 font-medium"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Please fill in your name and email to continue
                  </motion.p>
                )}
              </motion.div>
            </div>
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  );
};

export default HomePage;
