import { Product } from './types';

// Map database product to application product model
export const mapDbProductToProduct = (dbProduct: unknown): Product => {
  const p = dbProduct as Record<string, any>;
  return {
    id: p.id,
    sku: p.id?.toString() ?? '',
    name: p.name,
    description: p.description || '',
    price: p.price,
    image: p.image || '/placeholder.svg',
    category: p.type || 'general',
    featured: false,
    defaultQuantity: 1,
    inStock: true
  };
};

// Map order bump to product model
export const mapOrderBumpToProduct = (orderBump: unknown): Product => {
  const o = orderBump as Record<string, any>;
  return {
    id: o.id,
    sku: o.product_id || o.id,
    name: o.title,
    description: o.description || '',
    price: o.price,
    image: o.image || '/placeholder.svg',
    category: 'order_bump',
    featured: false,
    defaultQuantity: 1,
    inStock: true
  };
};
