import { CartItem } from '@/types/product-types';

export const normalizeCartItems = (items: unknown[]): CartItem[] => {
  console.log('[CartNormalizer] Normalizing cart items:', items);
  
  if (!Array.isArray(items)) {
    console.log('[CartNormalizer] Input is not an array:', typeof items);
    return [];
  }
  
  return items.map(item => ({
    id: (item as any).sku || (item as any).id || generateId(),
    sku: (item as any).sku || (item as any).id || generateId(),
    name: (item as any).name || 'Unknown Product',
    price: parseFloat((item as any).price) || 0,
    quantity: parseInt((item as any).quantity) || 1,
    image: (item as any).image || '/placeholder.svg',
    category: (item as any).category || 'wellness'
  }));
};

const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
