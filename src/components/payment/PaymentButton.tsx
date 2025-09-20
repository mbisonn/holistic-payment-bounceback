
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ onClick, isLoading }) => {
  // Button animation variants
  const buttonVariants = {
    initial: {
      scale: 1,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 8px 20px rgba(16, 185, 129, 0.3)"
    },
    tap: {
      scale: 0.97
    }
  };

  // Glow effect animation
  const glowVariants = {
    initial: {
      opacity: 0.5
    },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Infinity,
        duration: 2
      }
    }
  };

  // Sparkle animation
  const sparkleVariants = {
    animate: {
      x: [0, 4, 0, -4, 0],
      y: [0, -4, 0, 4, 0],
      scale: [1, 1.2, 1, 1.2, 1],
      rotate: [0, 15, 0, -15, 0],
      transition: { repeat: Infinity, duration: 3 }
    }
  };

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      className="relative"
    >
      {/* Glowing background effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg filter blur-md"
        variants={glowVariants}
        initial="initial"
        animate="animate"
        style={{ zIndex: -1 }}
      />
      
      <Button 
        onClick={onClick}
        disabled={isLoading}
        className="w-full h-auto py-5 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white relative overflow-hidden border-none shadow-lg flex items-center justify-center lead-button"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Securing Your Order...</span>
          </div>
        ) : (
          <>
            <div className="z-10 relative flex items-center gap-2 justify-center flex-wrap px-2 py-1">
              <ShieldCheck className="h-6 w-6 flex-shrink-0" />
              <span className="px-1">Transform Your Health Now!</span>
              <motion.div
                variants={sparkleVariants}
                animate="animate"
                className="absolute -right-1 -top-1"
              >
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </motion.div>
              <ChevronRight className="h-6 w-6 flex-shrink-0" />
            </div>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
            
            {/* Pulsing animation overlay */}
            <span className="absolute inset-0 bg-white opacity-0 animate-pulse"></span>
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default PaymentButton;
