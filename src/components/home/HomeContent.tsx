
import { Button } from '@/components/ui/button';
import { Star, Shield, Truck, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/productUtils';
import { Product } from '@/types/product-types';

interface HomeContentProps {
  products: Product[];
  featuredProducts: Product[];
  onCheckout?: () => void;
}

const HomeContent = ({ featuredProducts }: HomeContentProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: product.defaultQuantity || 1,
      image: product.image,
      category: product.category,
      description: product.description,
    };
    addToCart(cartItem);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-green-800 mb-4">
            Discover Natural Wellness Solutions
          </h1>
          <p className="text-lg text-green-700 mb-8">
            Explore our range of carefully crafted health products designed to enhance your well-being.
          </p>
          <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
            Explore Products
          </Button>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold text-center text-green-800 mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-md"
                  />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{product.name}</h3>
                  <p className="text-green-700 mb-3">{product.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-900">{formatCurrency(product.price)}</span>
                    <Button 
                      size="sm" 
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-center">
            <Shield className="text-green-500 mr-2" size={32} />
            <span className="text-sm text-gray-700">Secure Payments</span>
          </div>
          <div className="flex items-center justify-center">
            <Truck className="text-green-500 mr-2" size={32} />
            <span className="text-sm text-gray-700">Fast Shipping</span>
          </div>
          <div className="flex items-center justify-center">
            <Star className="text-green-500 mr-2" size={32} />
            <span className="text-sm text-gray-700">Top Rated</span>
          </div>
          <div className="flex items-center justify-center">
            <Award className="text-green-500 mr-2" size={32} />
            <span className="text-sm text-gray-700">Quality Assured</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeContent;
