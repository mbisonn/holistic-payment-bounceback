
import { z } from 'zod';

// Validation schemas for security
export const emailSchema = z.string().email().max(254);
export const nameSchema = z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/);
export const phoneSchema = z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/);
export const priceSchema = z.number().positive().max(10000000); // Max ₦100,000
export const quantitySchema = z.number().int().positive().max(100);
export const skuSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9\-_]+$/);

// Customer info validation
export const customerInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
});

// Cart item validation
export const cartItemSchema = z.object({
  id: skuSchema,
  sku: skuSchema,
  name: z.string().min(1).max(200),
  price: priceSchema,
  quantity: quantitySchema,
  image: z.string().url().optional(),
  category: z.string().max(50).optional(),
});

// Cart validation
export const cartSchema = z.array(cartItemSchema).min(1).max(50);

// Payment validation
export const paymentRequestSchema = z.object({
  cartItems: cartSchema,
  customerInfo: customerInfoSchema,
});

// Sanitize text input
export const sanitizeText = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

// Validate and sanitize customer info
export const validateCustomerInfo = (info: any) => {
  const result = customerInfoSchema.safeParse(info);
  if (!result.success) {
    throw new Error(`Invalid customer info: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  
  // Sanitize string fields
  return {
    ...result.data,
    name: sanitizeText(result.data.name),
    email: result.data.email.toLowerCase(),
    phone: result.data.phone ? sanitizeText(result.data.phone) : undefined,
    address: result.data.address ? sanitizeText(result.data.address) : undefined,
    city: result.data.city ? sanitizeText(result.data.city) : undefined,
    state: result.data.state ? sanitizeText(result.data.state) : undefined,
  };
};

// Validate and sanitize cart items
export const validateCartItems = (items: any[]) => {
  const result = cartSchema.safeParse(items);
  if (!result.success) {
    throw new Error(`Invalid cart items: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  
  // Sanitize string fields
  return result.data.map(item => ({
    ...item,
    name: sanitizeText(item.name),
    category: item.category ? sanitizeText(item.category) : undefined,
  }));
};
