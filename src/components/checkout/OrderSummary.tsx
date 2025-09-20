
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CartItem, CustomerInfo, DiscountCode, formatCurrency } from '@/utils/productUtils';
import { validateDiscountCode } from '@/utils/discountManager';
import { useToast } from '@/hooks/use-toast';
import PaystackLogo from '@/components/ui/paystack-logo';
import ShippingFeeDisplay from './ShippingFeeDisplay';

interface OrderSummaryProps {
  cart: CartItem[];
  total: number;
  discountCode: DiscountCode | null;
  discountedTotal: number;
  appliedCode: string;
  customerInfo: CustomerInfo;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleApplyDiscount: (discount: DiscountCode) => void;
  handleRemoveDiscount: () => void;
  handlePaymentSuccess: () => void;
  handlePayOnDelivery: () => void;
}

const OrderSummary = ({
  cart,
  total,
  discountCode,
  discountedTotal,
  appliedCode,
  customerInfo,
  isLoading,
  setIsLoading,
  handleApplyDiscount,
  handleRemoveDiscount,
  handlePayOnDelivery
}: OrderSummaryProps) => {
  const [discountInput, setDiscountInput] = useState('');
  const [shippingFee, setShippingFee] = useState(2500);
  const [finalTotal, setFinalTotal] = useState(discountedTotal + shippingFee);
  const { toast } = useToast();

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => console.log('Paystack script loaded');
    script.onerror = () => console.error('Failed to load Paystack script');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // --- Calculate total every change
  useEffect(() => {
    setFinalTotal(discountedTotal + shippingFee);
  }, [discountedTotal, shippingFee]);

  // --- Paystack redirect on payment button
  const handlePaystackRedirect = async () => {
    setIsLoading(true);
    try {
      // Generate unique reference
      const reference = `TENERA_${Date.now()}`;

      // Prepare Paystack params for the POST request
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY ?? ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customerInfo.email,
          amount: finalTotal * 100,
          reference,
          callback_url: 'https://www.teneraholisticandwellness.com/upsell',
          metadata: {
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            delivery_address: customerInfo.address,
            delivery_city: customerInfo.city,
            delivery_state: customerInfo.state,
            discount_code: discountCode?.code ?? '',
            order_bump: cart.filter(i => i.id.startsWith('order-bump-')).map(i => i.name).join(', '),
            cart_items: cart.map(item => `${item.name} x ${item.quantity}`).join(', ')
          }
        })
      });

      const resData = await paystackRes.json();
      if (resData?.data?.authorization_url) {
        // Redirect to Paystack (like screenshot)
        window.location.href = resData.data.authorization_url;
      } else {
        throw new Error(resData?.message || 'Unable to start payment');
      }
    } catch (err: any) {
      setIsLoading(false);
      alert('Error initializing payment: ' + (err.message || err));
    }
  };

  const handleDiscountSubmit = async () => {
    if (!discountInput.trim()) return;

    try {
      const result = await validateDiscountCode(discountInput.trim());
      if (result.isValid && result.discount) {
        // Convert the discount manager format to product-types format
        const discountCode: DiscountCode = {
          id: result.discount.id,
          code: result.discount.code,
          type: result.discount.discount_type === 'percentage' ? 'percentage' : 'fixed_amount',
          value: result.discount.discount_value,
          max_uses: result.discount.usage_limit,
          current_uses: result.discount.current_uses,
          is_active: result.discount.is_active,
          expires_at: result.discount.expires_at,
          created_at: new Date().toISOString()
        };
        
        handleApplyDiscount(discountCode);
        setDiscountInput('');
      } else {
        toast({
          title: "Invalid Code",
          description: result.error || "The discount code you entered is not valid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate discount code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Order Summary
          <Badge variant="secondary">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Discount Code Section */}
        <div className="space-y-3">
          <h4 className="font-medium">Discount Code</h4>
          {appliedCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Code Applied: {appliedCode}</p>
                <p className="text-sm text-green-600">
                  {discountCode?.type === 'percentage' 
                    ? `${discountCode.value}% off` 
                    : `₦${discountCode?.value} off`}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemoveDiscount}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter discount code"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDiscountSubmit()}
              />
              <Button 
                variant="outline" 
                onClick={handleDiscountSubmit}
                disabled={!discountInput.trim()}
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          
          {discountCode && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(total - discountedTotal)}</span>
            </div>
          )}
          
          {/* Add Shipping */}
          <div className="flex justify-between">
            <span>Shipping</span>
            <ShippingFeeDisplay onFeeChange={setShippingFee} />
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePaystackRedirect}
            disabled={isLoading || !customerInfo.email}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Pay with Card</span>
                <PaystackLogo className="h-4 w-auto" />
              </div>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handlePayOnDelivery}
            disabled={isLoading || !customerInfo.email}
          >
            {isLoading ? "Processing..." : "Pay on Delivery"}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Your payment information is secure and encrypted
        </p>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
