
import { Product } from '@/types/product-types';
import { products } from '@/data/productsCatalog';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Convert catalog items to Product interface
    return Object.values(products).map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      description: '',
      price: item.price,
      image: item.image,
      category: '',
      featured: false
    }));
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    return [];
  }
};

// Export the Customer Info type for re-use
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  [key: string]: string;
}

// Define and export CartItem type
export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  description?: string;
}

// Import DiscountCode from types instead of defining it here
export type { DiscountCode } from '@/types/product-types';

// Calculate discounted total
export const calculateDiscountedTotal = (total: number, discountCode: import('@/types/product-types').DiscountCode | null): number => {
  if (!discountCode) return total;
  
  if (discountCode.type === 'percentage') {
    return total - (total * discountCode.value / 100);
  } else {
    return Math.max(0, total - discountCode.value);
  }
};

// Format currency in Naira (moved from formatUtils.ts)
export const formatCurrency = (amount: number): string => {
  // Format in Nigerian Naira
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Nigerian States (moved from formatUtils.ts)
export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

// Get featured products
export const getFeaturedProducts = (): Product[] => {
  return Object.values(products).slice(0, 3).map(item => ({
    id: item.sku,
    sku: item.sku,
    name: item.name,
    description: '',
    price: item.price,
    image: item.image,
    category: '',
    featured: true
  }));
};

// Find product by id with proper type safety
export const getProductById = (id: string): Product | undefined => {
  const item = Object.values(products).find(product => product.sku === id);
  if (!item) return undefined;
  return {
    id: item.sku,
    sku: item.sku,
    name: item.name,
    description: '',
    price: item.price,
    image: item.image,
    category: '',
    featured: false
  };
};

// Find product by SKU
export const getProductBySku = (sku: string): Product | undefined => {
  const item = Object.values(products).find(product => product.sku === sku);
  if (!item) return undefined;
  return {
    id: item.sku,
    sku: item.sku,
    name: item.name,
    description: '',
    price: item.price,
    image: item.image,
    category: '',
    featured: false
  };
};

// Get products by category
export const getProductsByCategory = (): Product[] => {
  return Object.values(products).map(item => ({
    id: item.sku,
    sku: item.sku,
    name: item.name,
    description: '',
    price: item.price,
    image: item.image,
    category: '',
    featured: false
  }));
};

// Search products
export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return Object.values(products)
    .filter(product => product.name.toLowerCase().includes(searchTerm))
    .map(item => ({
      id: item.sku,
      sku: item.sku,
      name: item.name,
      description: '',
      price: item.price,
      image: item.image,
      category: '',
      featured: false
    }));
};
