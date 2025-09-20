import { CartItem } from '../../types/product-types.ts';
import { productsCatalog } from '../../data/productsCatalog.ts';

export interface ValidationResult {
  isValid: boolean;
  items: CartItem[];
  errors?: string[];
}

export function validateCartItems(items: unknown[]): ValidationResult {
  if (!Array.isArray(items)) {
    return {
      isValid: false,
      items: [],
      errors: ['Input is not an array']
    };
  }

  const validItems: CartItem[] = [];
  const errors: string[] = [];

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} is not an object`);
      return;
    }

    // Check required fields
    if (!(item as any).id && !(item as any).sku) {
      errors.push(`Item at index ${index} missing id/sku`);
      return;
    }

    if (!(item as any).name) {
      errors.push(`Item at index ${index} missing name`);
      return;
    }

    if (typeof (item as any).price !== 'number' || (item as any).price < 0) {
      errors.push(`Item at index ${index} has invalid price`);
      return;
    }

    if (typeof (item as any).quantity !== 'number' || (item as any).quantity < 1) {
      errors.push(`Item at index ${index} has invalid quantity`);
      return;
    }

    // Create valid cart item
    const validItem: CartItem = {
      id: (item as any).id || (item as any).sku,
      sku: (item as any).sku || (item as any).id,
      name: (item as any).name,
      price: (item as any).price,
      quantity: Math.max(1, Math.floor((item as any).quantity)),
      image: (item as any).image || undefined,
      description: (item as any).description || undefined
    };

    validItems.push(validItem);
  });

  return {
    isValid: Boolean(validItems.length),
    items: validItems,
    errors: errors.length > 0 ? errors : undefined
  };
}

export function normalizeId(id: string | number): string {
  return String(id).trim().toLowerCase();
}

export function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const obj = item as any;
  return (
    ('id' in obj || 'sku' in obj) &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    obj.price >= 0 &&
    typeof obj.quantity === 'number' &&
    obj.quantity >= 1
  );
}

export function normalizeCartItem(item: unknown): CartItem | null {
  if (!isValidCartItem(item)) {
    return null;
  }

  return {
    id: item.id || item.sku,
    sku: item.sku || item.id,
    name: item.name,
    price: item.price,
    quantity: Math.max(1, Math.floor(item.quantity)),
    image: item.image || undefined,
    description: item.description || undefined
  };
}

export function enrichCartItemsWithCatalog(items: unknown[]): CartItem[] {
  return items
    .map(item => {
      const sku = (item as any).sku || (item as any).id;
      const product = productsCatalog.find(p => p.sku === sku);
      if (!product) return null; // skip unknown SKUs
      return {
        id: sku,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: Math.max(1, Math.floor((item as any).quantity)),
        image: product.image || '',
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
