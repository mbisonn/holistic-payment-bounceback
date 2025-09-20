
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, TagIcon } from 'lucide-react';
import { DiscountCode } from '@/types/product-types';
import { motion } from 'framer-motion';

interface DiscountCodeInputProps {
  discountInput: string;
  setDiscountInput: (value: string) => void;
  handleApplyDiscount: () => void;
  handleRemoveDiscount: () => void;
  discountCode: DiscountCode | null;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  discountInput,
  setDiscountInput,
  handleApplyDiscount,
  handleRemoveDiscount,
  discountCode
}) => {
  if (discountCode) {
    return (
      <motion.div 
        className="flex items-center p-3 rounded-lg bg-green-500/20 border border-green-400/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CheckCircle size={18} className="text-green-400 mr-2" />
        <span className="flex-1 text-sm font-medium text-green-300">
          Discount code "{discountCode.code}" applied
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemoveDiscount}
          className="text-green-300 hover:bg-green-500/20 p-1 h-auto"
        >
          <XCircle size={16} />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative flex-1">
        <TagIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
        <Input 
          placeholder="Enter discount code"
          value={discountInput}
          onChange={(e) => setDiscountInput(e.target.value)}
          className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm"
        />
      </div>
      <Button 
        onClick={handleApplyDiscount} 
        variant="outline"
        className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        Apply
      </Button>
    </motion.div>
  );
};

export default DiscountCodeInput;
