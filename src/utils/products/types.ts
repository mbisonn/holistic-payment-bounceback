export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  category: string;
  defaultQuantity: number;
  inStock: boolean;
  shortDescription?: string;
  benefits?: string[];
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

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  currentUses?: number;
  expiryDate?: Date;
  used?: boolean;
}

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id?: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  total: number;
  discountCode?: DiscountCode;
  discountAmount?: number;
  orderBumps?: unknown[];
  status?: string;
  paymentReference?: string;
  source?: 'Storefront' | 'External';
  created_at?: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
  product?: Product;
  count?: number;
}
