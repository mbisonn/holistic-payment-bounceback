import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaystackLogo from '@/components/ui/paystack-logo';
import { CartItem, CustomerInfo } from '@/utils/productUtils';

interface TwoStepPaymentFormProps {
  cartItems: CartItem[];
  calculateTotal: () => number;
  onSuccess: () => void;
}

const TwoStepPaymentForm: React.FC<TwoStepPaymentFormProps> = ({
  cartItems,
  calculateTotal}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '+234',
    address: '',
    city: '',
    state: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStep1Valid = () => {
    return Boolean(
      customerInfo.name &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address &&
      customerInfo.city &&
      customerInfo.state
    );
  };

  const proceedToPayment = () => {
    if (isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const goBackToCustomerInfo = () => {
    setCurrentStep(1);
  };

  const handlePaymentClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call backend to generate Paystack payment link
      const response = await fetch('https://xjfkeblnxyjhxukqurvc.functions.supabase.co/functions/v1/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'upsell', // or 'downsell' if you want to support both, or make this dynamic
          customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          // Optionally, you can add reference, redirectUrl, etc.
        }),
      });
      const data = await response.json();
      if (data.success && data.data && data.data.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        setError(data.error || 'Failed to generate payment link.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="backdrop-blur-md bg-white/90 border border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Step 1: Your Information
                </CardTitle>
                <p className="text-gray-600">
                  Please provide your details for delivery and order processing
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                    placeholder="Enter your street address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City/LGA *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={customerInfo.state}
                      onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                      placeholder="Enter your state"
                      required
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button
                    onClick={proceedToPayment}
                    disabled={!isStep1Valid()}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg"
                  >
                    Continue to Secure Payment →
                    <span className="ml-2 text-sm opacity-90">
                      Complete Your Wellness Journey
                    </span>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="backdrop-blur-md bg-white/90 border border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Step 2: Secure Payment
                </CardTitle>
                <p className="text-gray-600">
                  Complete your order with our secure payment system
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 font-bold text-green-800">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>₦{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Delivery Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>{customerInfo.name}</p>
                    <p>{customerInfo.email}</p>
                    <p>{customerInfo.phone}</p>
                    <p>{customerInfo.address}, {customerInfo.city}, {customerInfo.state}</p>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>Secured by</span>
                    <PaystackLogo className="h-5" />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handlePaymentClick}
                      disabled={isLoading}
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span>🔒 Pay Securely Now</span>
                          <span className="text-sm opacity-90">
                            Transform Your Health Today - ₦{calculateTotal().toLocaleString()}
                          </span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                  
                  <Button
                    variant="outline"
                    onClick={goBackToCustomerInfo}
                    className="w-full"
                  >
                    ← Back to Customer Information
                  </Button>
                </div>

                {error && (
                  <div className="text-red-600 text-center font-medium mb-4">{error}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TwoStepPaymentForm;
