
import { DiscountCode } from '../types/product-types';

// Sample discount codes - this would typically be fetched from a database
export const discountCodes: Record<string, DiscountCode> = {
  "WELCOME10": {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    max_uses: 100,
    current_uses: 0
  },
  "TENERA5000": {
    code: "TENERA5000",
    type: "fixed_amount",
    value: 5000,
    max_uses: 50,
    current_uses: 0
  }
};

// Function to validate discount code
export const validateDiscountCode = (code: string): DiscountCode | null => {
  const discountCode = discountCodes[code.toUpperCase()];
  if (discountCode) {
    return discountCode;
  }
  return null;
};

// Function to apply discount to amount
export const applyDiscount = (amount: number, discount: DiscountCode): number => {
  if (discount.type === "percentage") {
    return amount - (amount * discount.value / 100);
  } else {
    return Math.max(0, amount - discount.value);
  }
};

// Function to mark discount code as used
export const markDiscountCodeAsUsed = (code: string): void => {
  // In a real implementation, you would update the database here
  // For this example, we'll just log the action
  console.log(`Discount code ${code} marked as used.`);
};
