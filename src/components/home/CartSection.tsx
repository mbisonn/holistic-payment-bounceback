
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, X } from 'lucide-react';
import { CartItem } from '@/types/product-types';

interface CartSectionProps {
  cart: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateCart: (items: CartItem[]) => void;
  discount: {
    code: string;
    discountCode: any;
    discountInput: string;
    setDiscountInput: (value: string) => void;
    handleApplyDiscount: () => void;
    handleRemoveDiscount: () => void;
  };
  shippingFee: number;
  showShipping: boolean;
  orderBumpTotal: number;
  productSubtotal: number;
  discountedTotal: number;
  finalTotal: number;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  discount,
  shippingFee,
  showShipping,
  orderBumpTotal,
  productSubtotal,
  discountedTotal,
  finalTotal
}) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-white/60 text-center py-4">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <p className="text-white/70 text-sm">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-8 w-8 p-0 border-white/30 text-white hover:bg-white/20"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0 border-white/30 text-white hover:bg-white/20"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Products Subtotal:</span>
                  <span>₦{productSubtotal.toLocaleString()}</span>
                </div>
                {orderBumpTotal > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Special Offers:</span>
                    <span>₦{orderBumpTotal.toLocaleString()}</span>
                  </div>
                )}
                {discount.discountCode && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discount.code}):</span>
                    <span>-₦{((productSubtotal + orderBumpTotal) - discountedTotal).toLocaleString()}</span>
                  </div>
                )}
                {showShipping && (
                  <div className="flex justify-between text-white/80">
                    <span>Shipping:</span>
                    <span>₦{shippingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-lg border-t border-white/20 pt-2">
                  <span>Total:</span>
                  <span>₦{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CartSection;
