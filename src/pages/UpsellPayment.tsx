import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PaystackIntegration from '@/components/PaystackIntegration';

interface UpsellProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const UpsellPayment = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<UpsellProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const customerEmail = searchParams.get('email') || '';
  const customerName = searchParams.get('name') || '';

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      const { data, error } = await supabase
        .from('upsell_products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setProduct({
        ...data,
        description: data.description || '',
        image_url: data.image_url || null
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      toast.success('Payment successful! Thank you for your purchase.');
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = 'https://www.teneraholisticandwellness.com/thankyoupage';
      }, 2000);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const calculateSavings = () => {
    if (!product || !product.original_price) return 0;
    return product.original_price - product.price;
  };

  const getDiscountPercentage = () => {
    if (!product || !product.original_price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-glass-text" />
            <span className="text-glass-text">Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-glass-text mb-4">Product Not Found</h1>
          <p className="text-glass-text-secondary">The product you're looking for is not available.</p>
        </div>
      </div>
    );
  }

  const finalPrice = product.price;
  const customerInfo = {
    name: customerName || 'Guest Customer',
    email: customerEmail || 'guest@example.com',
    phone: '',
    address: '',
    city: '',
    state: ''
  };

  const cartItems = [{
    id: product.id,
    sku: product.id,
    name: product.name,
    price: finalPrice,
    quantity: 1,
    image: product.image_url || undefined
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Special Offer Just For You! 🎉
            </h1>
            <p className="text-xl text-gray-200">
              Don't miss this exclusive opportunity to enhance your wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Details */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="aspect-square mb-6 overflow-hidden rounded-lg">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-glass-text mb-2">{product.name}</h2>
                    <Badge className="mb-3 bg-green-500/20 text-green-400 border-green-500/30">
                      Premium Product
                    </Badge>
                  </div>

                  <p className="text-glass-text-secondary leading-relaxed">
                    {product.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-glass-text">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span>Premium quality ingredients</span>
                    </div>
                    <div className="flex items-center text-glass-text">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span>Scientifically formulated</span>
                    </div>
                    <div className="flex items-center text-glass-text">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span>Trusted by thousands</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-glass-text-secondary">(4.9/5) • 1,200+ reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-glass-text text-center">
                  Complete Your Purchase
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center space-y-4">
                    {product.original_price && product.original_price > product.price && (
                      <div>
                        <div className="text-4xl font-bold text-glass-text">
                          ₦{finalPrice.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg text-glass-text-secondary line-through">
                            ₦{product.original_price.toLocaleString()}
                          </span>
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            {getDiscountPercentage()}% OFF
                          </Badge>
                        </div>
                        <p className="text-green-400 font-semibold">
                          You save ₦{calculateSavings().toLocaleString()}!
                        </p>
                      </div>
                    )}
                    
                    {!product.original_price || product.original_price <= product.price && (
                      <div className="text-4xl font-bold text-glass-text">
                        ₦{product.price.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  {customerName && (
                    <div className="bg-glass-accent rounded-lg p-4">
                      <h4 className="font-semibold text-glass-text mb-2">Customer Details</h4>
                      <p className="text-glass-text-secondary">{customerName}</p>
                      {customerEmail && (
                        <p className="text-glass-text-secondary">{customerEmail}</p>
                      )}
                    </div>
                  )}

                  {/* Payment Button */}
                  <div className="space-y-4">
                    <PaystackIntegration
                      amount={finalPrice}
                      email={customerInfo.email}
                      customerInfo={customerInfo}
                      cartItems={cartItems}
                      onSuccess={handlePaymentSuccess}
                      isLoading={isPaymentLoading}
                      setIsLoading={setIsPaymentLoading}
                    />
                    
                    <p className="text-center text-glass-text-secondary text-sm">
                      🔒 Secure payment powered by Paystack
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="text-center space-y-2">
                    <p className="text-glass-text-secondary text-sm">
                      ✅ 30-day money-back guarantee
                    </p>
                    <p className="text-glass-text-secondary text-sm">
                      🚚 Fast & secure delivery
                    </p>
                    <p className="text-glass-text-secondary text-sm">
                      📞 24/7 customer support
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgency Banner */}
          <div className="mt-8 text-center">
            <div className="glass-card p-4 border-l-4 border-orange-500">
              <p className="text-orange-400 font-semibold">
                ⏰ Limited Time Offer - Don't Miss Out!
              </p>
              <p className="text-glass-text-secondary text-sm">
                This special pricing is available for a limited time only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellPayment;