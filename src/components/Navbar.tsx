import { Link } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartSheet from "./CartSheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { itemCount } = useCart();
  const isMobile = useIsMobile();
  
  return (
    <nav className="flex items-center justify-between px-2 sm:px-6 py-2 bg-white/80 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 3D Company Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/e0399505-a75a-4c2c-a074-608abde4cf7c.png" 
              alt="Bounce back to life Consult" 
              className="h-10 w-10 object-contain"
            />
            <div className="relative">
              <span className="text-green-700 font-bold text-xl md:text-2xl transform-gpu transition-transform hover:scale-105 drop-shadow-lg"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(34, 197, 94, 0.2)',
                      background: 'linear-gradient(145deg, #15803d, #22c55e)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      borderRadius: '12px',
                      padding: '4px 8px',
                      border: '2px solid transparent',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(145deg, #15803d, #22c55e)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'content-box, border-box'
                    }}>
                Bounce back to life <span style={{ color: '#22c55e' }}>Consult</span>
              </span>
            </div>
          </Link>
          
          {/* Navigation Links - Hidden on Mobile */}
          {!isMobile && (
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/order-tracking"
                className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
              >
                Track Order
              </Link>
            </div>
          )}
          
          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Cart Button with Counter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <CartSheet />
              </SheetContent>
            </Sheet>
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px]">
                  <div className="py-6 flex flex-col gap-4">
                    <h3 className="font-bold text-lg mb-4">Bounce back to life Consult</h3>
                    <Link to="/" className="text-lg py-2 hover:text-green-600">
                      Home
                    </Link>
                    <Link to="/order-tracking" className="text-lg py-2 hover:text-blue-500">
                      Track Order
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
