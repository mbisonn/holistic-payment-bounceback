import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOrderBumps } from '@/hooks/useOrderBumps';
import { getApplicableOrderBumps, addOrderBumpToCart } from '@/utils/orderBumpUtils';
import { CartItem } from '@/types/product-types';
import { useToast } from '@/hooks/use-toast';
import CustomerInfoSection from '@/components/home/CustomerInfoSection';
import OrderBumpCard from '@/components/home/OrderBumpCard';
import Header from '@/components/home/Header';
import { calculateDiscountedTotal } from '@/utils/discountManager';
import { DiscountCode } from '@/types/product-types';
import { getShippingFee } from '@/utils/shippingManager';
import { enrichCartItemsWithCatalog } from '@/utils/cart/cartValidationUtils';
import { trackPageVisit, updateCustomerProfile } from '@/utils/crmService';
import PremiumFooter from '@/components/home/PremiumFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Gift, CreditCard } from 'lucide-react';
import DiscountCodeInput from '@/components/home/DiscountCodeInput';
import CartSection from '@/components/home/CartSection';
import { PAYMENT_ON_DELIVERY_URL, SUCCESS_REDIRECT_URL, PAYSTACK_PUBLIC_KEY, PAYSTACK_SUBACCOUNT } from '@/utils/paystackConfig';

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBumps, setSelectedBumps] = useState<Record<string, boolean>>({});
  const { orderBumps } = useOrderBumps();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    lga: '',
    state: '',
    country: 'Nigeria'
  });
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(2500);
  const [, setIsProcessingPayment] = useState(false);

  // Safely handle order bumps data
  const safeOrderBumps = orderBumps ? orderBumps.map((bump: any) => ({
    ...bump,
    isactive: bump.isactive || false
  })) : [];

  const applicableOrderBumps = getApplicableOrderBumps(safeOrderBumps, cart);

  // Enhanced cart data checking
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TENERA_CART_UPDATE' && event.data.data) {
        const cartItems = event.data.data.cartItems || [];
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          const enriched = enrichCartItemsWithCatalog(cartItems);
          setCart(enriched);
          localStorage.setItem('externalCheckoutMode', 'true');
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Only restore cart from storage once on mount
      const storageKeys = ['teneraCart', 'cartItems', 'checkoutData', 'cartSync'];
      for (const key of storageKeys) {
        try {
          const data = localStorage.getItem(key);
          if (data && data !== 'null' && data !== '[]') {
            const parsed = JSON.parse(data);
            if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
              const enriched = enrichCartItemsWithCatalog(parsed.items);
              setCart(enriched);
              localStorage.removeItem(key);
              break;
            } else if (Array.isArray(parsed) && parsed.length > 0) {
              const enriched = enrichCartItemsWithCatalog(parsed);
              setCart(enriched);
              localStorage.removeItem(key);
              break;
            }
          }
        } catch (e) {
          console.error(`Error checking ${key}:`, e);
        }
      }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Track page visit when customer email is available
  useEffect(() => {
    if (customerInfo.email) {
      trackPageVisit(customerInfo.email, '/');
    }
  }, [customerInfo.email]);

  const updateCustomerInfo = (field: string, value: string) => {
    setCustomerInfo(prev => {
      const updated = { ...prev, [field]: value };
      
      if (updated.email && (field === 'email' || Object.keys(updated).length > 1)) {
        updateCustomerProfile({
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          address: updated.street,
          city: updated.lga,
          state: updated.state
        });
      }
      
      return updated;
    });
  };

  // Shipping fee calculation
  useEffect(() => {
    const updateFee = async () => {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const fee = await getShippingFee(customerInfo.state, [total]);
      setShippingFee(fee);
    };
    updateFee();
  }, [cart, customerInfo.state]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountCode ? (subtotal - calculateDiscountedTotal(subtotal, {
    id: discountCode.id || 'mock',
    code: discountCode.code,
    discount_type: discountCode.type === 'percentage' ? 'percentage' : 'fixed',
    discount_value: discountCode.value,
    is_active: true,
    current_uses: 0
  })) : 0;
  const discountedTotal = discountCode ? calculateDiscountedTotal(subtotal, {
    id: discountCode.id || 'mock',
    code: discountCode.code,
    discount_type: discountCode.type === 'percentage' ? 'percentage' : 'fixed',
    discount_value: discountCode.value,
    is_active: true,
    current_uses: 0
  }) : subtotal;
  const finalTotal = discountedTotal + shippingFee;

  const handleOrderBumpToggle = (orderBumpId: string) => {
    const orderBump = applicableOrderBumps.find(ob => ob.id === orderBumpId);
    if (!orderBump) return;

    const isCurrentlySelected = selectedBumps[orderBumpId];
    
    if (!isCurrentlySelected) {
      const updatedCart = addOrderBumpToCart(cart, orderBump);
      setCart(updatedCart);
    }

    setSelectedBumps(prev => ({
      ...prev,
      [orderBumpId]: !isCurrentlySelected
    }));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handlePaymentOnDelivery = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email to continue",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    // AUTOMATION: Call automation-handler for payment on delivery
    try {
      await fetch('/functions/v1/automation-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_on_delivery',
          customer: { email: customerInfo.email, name: customerInfo.name },
          order: { cart, total: finalTotal }
        })
      });
    } catch (e) { console.warn('Automation handler error:', e); }

    // Redirect to payment on delivery URL
    window.location.href = PAYMENT_ON_DELIVERY_URL;
  };

  const handleCheckout = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email to continue",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      toast({
        title: "Loading Payment...",
        description: "Please wait while we prepare your secure checkout",
      });

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector('script[src*="paystack"]');
          if (existingScript) {
            existingScript.remove();
          }
          
          const script = document.createElement('script');
          script.src = "https://js.paystack.co/v1/inline.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Paystack'));
          document.head.appendChild(script);
        });
      }
      
      const reference = `BOUNCE_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const paystackAmount = Math.round(finalTotal * 100); // Convert to kobo

      console.log('Initiating payment with:', {
        reference,
        amount: paystackAmount,
        email: customerInfo.email,
        cartItems: cart.length
      });

      window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: customerInfo.email.trim().toLowerCase(),
        amount: paystackAmount,
        currency: 'NGN',
        ref: reference,
        subaccount: PAYSTACK_SUBACCOUNT,
        metadata: {
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          delivery_address: customerInfo.street,
          delivery_city: customerInfo.lga,
          delivery_state: customerInfo.state,
          cart_items: cart.map(item => `${item.name} x ${item.quantity}`).join(', '),
          discount_code: discountCode?.code || '',
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          order_source: 'index_page',
          payment_method: 'card'
        },
        callback: async function(response: any) {
          console.log('Payment completed successfully:', response.reference);
          
          toast({
            title: "Payment Successful! 🎉",
            description: "Redirecting to success page...",
          });
          
          // Save payment details
          localStorage.setItem('customerEmail', customerInfo.email);
          localStorage.setItem('lastPaymentReference', response.reference);
          localStorage.setItem('paymentSuccess', 'true');

          // AUTOMATION: Call automation-handler for Paystack purchase
          try {
            await fetch('/functions/v1/automation-handler', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'purchase_paystack',
                customer: { email: customerInfo.email, name: customerInfo.name },
                order: { reference, cart, total: finalTotal }
              })
            });
          } catch (e) { console.warn('Automation handler error:', e); }

          // Clear cart data
          setCart([]);
          
          // Redirect to success page
          setTimeout(() => {
            window.location.href = SUCCESS_REDIRECT_URL;
          }, 1500);
        },
        onClose: function() {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "You can try again when ready.",
          });
        },
        onError: function(error: any) {
          console.error('Payment error:', error);
          setIsProcessingPayment(false);
          toast({
            title: "Payment Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive"
          });
        }
      }).openIframe();
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessingPayment(false);
      toast({
        title: "Payment Error",
        description: "Unable to load payment system. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    // Mock discount code validation
    if (code === 'BOUNCE10') {
      setDiscountCode({
        id: 'mocked',
        code: 'BOUNCE10',
        type: 'percentage',
        value: 10,
        max_uses: 100,
        current_uses: 10,
        is_active: true,
        expires_at: null,
        created_at: new Date().toISOString()
      });
    } else {
      toast({ title: 'Invalid discount code', description: 'Please try again', variant: 'destructive' });
      setDiscountCode(null);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode(null);
    setDiscountInput('');
  };

  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      <div className="relative z-10">
        {/* Animated logo header with heading */}
      <Header />
        {/* Main content */}
        <main className="container mx-auto px-4 py-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Customer Info */}
            <div className="space-y-8">
            <CustomerInfoSection 
              customerInfo={customerInfo}
              updateCustomerInfo={updateCustomerInfo}
            />
            </div>
            {/* Right Column - Discount, Cart, Special Offers, Payment */}
            <div className="space-y-8">
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
                orderBumpTotal={0} // You can calculate this if needed
                productSubtotal={subtotal}
                discountedTotal={discountedTotal}
                finalTotal={finalTotal}
              />
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
                    <div className="grid grid-cols-1 gap-4">
                      {applicableOrderBumps.map(orderBump => (
                        <Card key={orderBump.id} className="overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {orderBump.image_url && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-yellow-300">
                                  <img 
                                    src={orderBump.image_url} 
                                    alt={orderBump.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-bold text-lg text-yellow-900">{orderBump.title}</h4>
                                    {orderBump.discounted_price && orderBump.discounted_price < orderBump.original_price && (
                                      <Badge className="mt-1 bg-yellow-600 text-white">
                                        {Math.round(((orderBump.original_price - orderBump.discounted_price) / orderBump.original_price) * 100)}% OFF
                                      </Badge>
                                    )}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={!!selectedBumps[orderBump.id]}
                                    onChange={() => handleOrderBumpToggle(orderBump.id)}
                                    className="w-6 h-6 rounded border-2 border-yellow-700 accent-yellow-600"
                                  />
                                </div>
                                <p className="text-sm text-yellow-900 mt-2">{orderBump.description}</p>
                                <div className="flex items-center gap-3 mt-3">
                                  <span className="text-2xl font-bold text-white bg-yellow-600 px-3 py-1 rounded-lg">
                                    ₦{(orderBump.discounted_price || orderBump.original_price).toLocaleString()}
                                  </span>
                                  {orderBump.discounted_price && orderBump.discounted_price < orderBump.original_price && (
                                    <span className="text-lg text-yellow-800 line-through">
                                      ₦{orderBump.original_price.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Payment Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col gap-4 w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-4 md:py-6 text-lg md:text-xl font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-2xl hover:shadow-pink-400/60 hover:shadow-3xl transition-all duration-300 rounded-2xl border border-pink-400 ring-2 ring-pink-400/40 ring-offset-2 focus:ring-4 focus:ring-pink-500/60 animate-glow"
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
                    className={`w-full py-4 md:py-6 text-lg md:text-xl font-bold bg-transparent border-2 border-white text-white shadow-2xl transition-all duration-300 rounded-2xl ${(!customerInfo.name || !customerInfo.email) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                    type="button"
                    disabled={!customerInfo.name || !customerInfo.email}
                    onClick={handlePaymentOnDelivery}
                  >
                    Payment on Delivery
                  </Button>
                </motion.div>
              </motion.div>
                  </div>
              </div>
        </main>
        {/* Premium footer at the bottom */}
        <PremiumFooter />
      </div>
    </div>
  );
};

export default Index;
