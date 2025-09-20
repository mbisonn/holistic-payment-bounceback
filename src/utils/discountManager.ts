
// Mock discount manager since discount_codes table doesn't exist in the current schema
interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  usage_limit?: number;
  current_uses: number;
  expires_at?: string;
}

// Mock discount codes for demonstration
const mockDiscountCodes: DiscountCode[] = [
  {
    id: '1',
    code: 'WELCOME20',
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true,
    usage_limit: 100,
    current_uses: 0,
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: '2',
    code: 'SAVE50',
    discount_type: 'fixed',
    discount_value: 50,
    is_active: true,
    usage_limit: 50,
    current_uses: 0,
    expires_at: '2024-12-31T23:59:59Z'
  }
];

export const validateDiscountCode = async (code: string): Promise<{ isValid: boolean; discount?: DiscountCode; error?: string }> => {
  try {
    // Mock validation since we don't have the discount_codes table
    const discount = mockDiscountCodes.find(d => d.code.toLowerCase() === code.toLowerCase());
    
    if (!discount) {
      return { isValid: false, error: 'Discount code not found' };
    }

    if (!discount.is_active) {
      return { isValid: false, error: 'Discount code is not active' };
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return { isValid: false, error: 'Discount code has expired' };
    }

    if (discount.usage_limit && discount.current_uses >= discount.usage_limit) {
      return { isValid: false, error: 'Discount code usage limit reached' };
    }

    return { isValid: true, discount };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { isValid: false, error: 'Failed to validate discount code' };
  }
};

export const applyDiscount = (subtotal: number, discount: DiscountCode): number => {
  if (discount.discount_type === 'percentage') {
    return subtotal * (discount.discount_value / 100);
  } else {
    return Math.min(discount.discount_value, subtotal);
  }
};

export const getDiscountAmount = (subtotal: number, discount: DiscountCode): number => {
  return applyDiscount(subtotal, discount);
};

export const calculateDiscountedTotal = (subtotal: number, discount: DiscountCode): number => {
  const discountAmount = applyDiscount(subtotal, discount);
  return Math.max(0, subtotal - discountAmount);
};
