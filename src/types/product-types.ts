
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  featured?: boolean;
  discountPercent?: number;
  category?: string;
  defaultQuantity?: number;
  benefits?: string[];
  secondaryImages?: string[];
  
  // Add the missing properties that are being referenced in ProductDetail.tsx
  inStock?: boolean;
  originalPrice?: number;
  shortDescription?: string;
  ingredients?: string;
  usage?: string;
  dosage?: string;
}

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string; // Added category as optional to fix the TS error
  description?: string; // Add description as optional to fix the TS error
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  [key: string]: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  quantity_multiplier: number;
  is_bumper_offer: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DiscountCode {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  max_uses?: number;
  current_uses?: number;
  is_active?: boolean;
  expires_at?: string | null;
  created_at?: string;
  used?: boolean; // Add used property
}
