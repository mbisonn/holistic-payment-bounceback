
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/productUtils';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartSheet = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  
  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="mb-4">
        <SheetTitle>Your Cart</SheetTitle>
        <SheetDescription>
          {cart.length === 0 ? (
            "Your cart is empty"
          ) : (
            `You have ${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart`
          )}
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-1 overflow-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-4">No items in your cart</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 animate-fade-in">
                <div className="h-16 w-16 rounded-md bg-gray-50 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="mt-auto pt-4">
          <Separator className="mb-4" />
          
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Shipping</span>
            <span className="font-medium">Free</span>
          </div>
          <div className="flex justify-between mb-4 text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
          
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Checkout Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSheet;
