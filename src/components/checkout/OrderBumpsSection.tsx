import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CartItem } from '@/utils/productUtils';

interface OrderBump {
  id: string;
  title: string;
  description: string | null;
  original_price: number;
  discounted_price: number | null;
  image_url: string | null;
  is_active: boolean;
}

interface OrderBumpsSectionProps {
  cart: CartItem[];
  updateCart: (items: CartItem[]) => void;
}

const OrderBumpsSection = ({ cart, updateCart }: OrderBumpsSectionProps) => {
  const { data: orderBumps, isLoading } = useQuery({
    queryKey: ['order-bumps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_bumps')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as OrderBump[];
    }
  });

  const isInCart = (orderBumpId: string): boolean => {
    return cart.some(item => item.id === orderBumpId);
  };

  const addToCart = (orderBump: OrderBump): void => {
    const price = orderBump.discounted_price || orderBump.original_price;
    const newItem: CartItem = {
      id: orderBump.id,
      name: orderBump.title,
      price: price,
      quantity: 1,
      image: orderBump.image_url || '',
      sku: orderBump.id
    };
    updateCart([...cart, newItem]);
  };

  const removeFromCart = (orderBumpId: string): void => {
    const updatedCart = cart.filter(item => item.id !== orderBumpId);
    updateCart(updatedCart);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-white/70">Loading order bumps...</div>;
  }

  if (!orderBumps || orderBumps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {orderBumps.map((orderBump) => {
        const inCart = isInCart(orderBump.id);
        const finalPrice = orderBump.discounted_price || orderBump.original_price;
        const hasDiscount = orderBump.discounted_price && orderBump.discounted_price < orderBump.original_price;
        const discountPercentage = hasDiscount 
          ? Math.round(((orderBump.original_price - orderBump.discounted_price!) / orderBump.original_price) * 100)
          : 0;

        return (
          <Card key={orderBump.id} className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 ${
            inCart 
              ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/25' 
              : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {orderBump.image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={orderBump.image_url} 
                      alt={orderBump.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-black leading-tight">
                        {orderBump.title}
                      </h4>
                      
                      {hasDiscount && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold glow-soft"
                        >
                          {discountPercentage}% OFF - Limited Time!
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant={inCart ? "destructive" : "default"}
                      size="sm"
                      onClick={() => inCart ? removeFromCart(orderBump.id) : addToCart(orderBump)}
                      className="flex items-center gap-2"
                    >
                      {inCart ? (
                        <>
                          <Minus className="w-4 h-4" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {orderBump.description && (
                    <p className="text-sm text-gray-700 leading-relaxed mt-3">
                      {orderBump.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-2xl font-bold text-black">
                      {formatCurrency(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-black/60 line-through">
                        {formatCurrency(orderBump.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            {inCart && (
              <div className="absolute top-3 right-3">
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold glow-badge">
                  Added ✓
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default OrderBumpsSection;