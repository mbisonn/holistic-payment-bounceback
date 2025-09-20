
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import CartDataLoader from '@/components/checkout/CartDataLoader';
import EmptyCartMessage from '@/components/checkout/EmptyCartMessage';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import CartItemsList from '@/components/checkout/CartItemsList';
import OrderBumpsSection from '@/components/checkout/OrderBumpsSection';
import { CustomerInfo } from '@/types/product-types';

const CheckoutForm = () => {
  const { cart, updateCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setCustomerInfo(prev => ({ ...prev, state: value }));
  };

  if (cart.length === 0) {
    return <EmptyCartMessage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartDataLoader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CustomerInfoForm 
            customerInfo={customerInfo}
            handleChange={handleCustomerInfoChange}
            handleStateChange={handleStateChange}
          />
          
          <OrderBumpsSection
            cart={cart}
            updateCart={updateCart}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CartItemsList cartItems={cart} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
