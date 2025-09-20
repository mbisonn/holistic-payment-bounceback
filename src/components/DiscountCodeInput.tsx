
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, TagIcon } from 'lucide-react';
import { DiscountCode } from '@/types/product-types';
import { validateDiscountCode } from '@/utils/discountManager';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface DiscountCodeInputProps {
  onApplyDiscount: (discount: DiscountCode) => void;
  isDiscountApplied: boolean;
  onRemoveDiscount: () => void;
  appliedCode?: string;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({ 
  onApplyDiscount, 
  isDiscountApplied, 
  onRemoveDiscount,
  appliedCode
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleApplyDiscount = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await validateDiscountCode(code);
      
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
        
        onApplyDiscount(discountCode);
        toast({
          title: "Success",
          description: `Discount code "${code}" applied successfully!`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: result.error || "This code is invalid or has already been used",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate discount code",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (isDiscountApplied) {
    return (
      <motion.div 
        className="flex items-center p-2 rounded-md bg-green-50 border border-green-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CheckCircle size={18} className="text-green-500 mr-2" />
        <span className="flex-1 text-sm font-medium text-green-800">
          Discount code "{appliedCode}" applied
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemoveDiscount}
          className="text-green-700 hover:bg-green-100 p-1 h-auto"
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
        <TagIcon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Enter discount code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="pl-8 border-green-200 focus:border-green-400"
        />
      </div>
      <Button 
        onClick={handleApplyDiscount} 
        disabled={isValidating} 
        variant="outline"
        className="border-green-400 text-green-700 hover:bg-green-50"
      >
        {isValidating ? (
          <>
            <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Validating...
          </>
        ) : (
          'Apply'
        )}
      </Button>
    </motion.div>
  );
};

export default DiscountCodeInput;
