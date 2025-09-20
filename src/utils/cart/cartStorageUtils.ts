import { CartItem } from '@/types/product-types';

export interface CartStorageResult {
  items: CartItem[];
  source: string;
}

export const loadCartFromStorage = (): CartStorageResult => {
  console.log("loadCartFromStorage - Checking all storage keys for cart data");
  
  // Define all possible storage keys, prioritizing TENERA_CART_UPDATE
  const storageKeys = [
    'TENERA_CART_UPDATE', // Highest priority for external cart sync
    'teneraCart',
    'teneraCheckoutData', 
    'systemeCart',
    'cart',
    'cartItems',
    'pendingOrderData',
    'TeneraShoppingCart',
    'TeneraShoppingCartData',
    'TeneraShoppingCartItems',
    'TeneraShoppingCart_items'
  ];

  console.log("loadCartFromStorage - Checking keys:", storageKeys);

  for (const key of storageKeys) {
    try {
      const data = localStorage.getItem(key);
      if (data && data !== 'null' && data !== '[]') {
        console.log(`loadCartFromStorage - Found data in ${key}:`, data.substring(0, 200) + '...');
        
        const parsed = JSON.parse(data);
        let items: CartItem[] = [];

        // Handle TENERA_CART_UPDATE format specifically with enhanced nested parsing
        if (key === 'TENERA_CART_UPDATE') {
          console.log('loadCartFromStorage - Processing TENERA_CART_UPDATE format:', {
            hasData: !!parsed.data,
            dataKeys: parsed.data ? Object.keys(parsed.data) : 'no data',
            fullStructure: parsed
          });
          
          // Try multiple levels of nesting for TENERA_CART_UPDATE
          if (parsed.data && parsed.data.data && Array.isArray(parsed.data.data.cartItems)) {
            items = normalizeCartItems(parsed.data.data.cartItems);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE.data.data.cartItems`);
          }
          // Check if it's the message format with data.cartItems
          else if (parsed.data && Array.isArray(parsed.data.cartItems)) {
            items = normalizeCartItems(parsed.data.cartItems);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE.data.cartItems`);
          }
          // Check if data.data is an array
          else if (parsed.data && Array.isArray(parsed.data.data)) {
            items = normalizeCartItems(parsed.data.data);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE.data.data array`);
          }
          // Check if data is an array
          else if (parsed.data && Array.isArray(parsed.data)) {
            items = normalizeCartItems(parsed.data);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE.data array`);
          }
          // Check if it's direct cartItems array
          else if (parsed.cartItems && Array.isArray(parsed.cartItems)) {
            items = normalizeCartItems(parsed.cartItems);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE.cartItems`);
          }
          // Check if the whole thing is an array
          else if (Array.isArray(parsed)) {
            items = normalizeCartItems(parsed);
            console.log(`loadCartFromStorage - Extracted ${items.length} items from TENERA_CART_UPDATE array`);
          }
          else {
            console.log('loadCartFromStorage - Could not find cart items in TENERA_CART_UPDATE structure:', JSON.stringify(parsed, null, 2));
          }
        }
        // Handle other formats
        else if (Array.isArray(parsed)) {
          console.log(`loadCartFromStorage - Parsed data from ${key} is an array with ${parsed.length} items`);
          items = normalizeCartItems(parsed);
        } else if (parsed.items && Array.isArray(parsed.items)) {
          console.log(`loadCartFromStorage - Found items array in ${key}.items with ${parsed.items.length} items`);
          items = normalizeCartItems(parsed.items);
        } else if (parsed.cartItems && Array.isArray(parsed.cartItems)) {
          console.log(`loadCartFromStorage - Found cartItems array in ${key}.cartItems with ${parsed.cartItems.length} items`);
          items = normalizeCartItems(parsed.cartItems);
        } else if (parsed.data && parsed.data.cartItems && Array.isArray(parsed.data.cartItems)) {
          console.log(`loadCartFromStorage - Found data.cartItems array in ${key} with ${parsed.data.cartItems.length} items`);
          items = normalizeCartItems(parsed.data.cartItems);
        }

        if (items.length > 0) {
          console.log(`loadCartFromStorage - Successfully loaded ${items.length} items from ${key}`);
          return { items, source: key };
        } else {
          console.log(`loadCartFromStorage - No valid items found in ${key}`);
        }
      }
    } catch (e) {
      console.error(`loadCartFromStorage - Error parsing ${key}:`, e);
    }
  }

  console.log("loadCartFromStorage - No cart data found in any storage location including TENERA_CART_UPDATE");
  return { items: [], source: 'none' };
};

const normalizeCartItems = (items: unknown[]): CartItem[] => {
  if (!Array.isArray(items)) {
    console.log('normalizeCartItems - Input is not an array:', typeof items);
    return [];
  }
  
  console.log('normalizeCartItems - Processing items:', items);
  
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

export const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('systemeCart', JSON.stringify(items));
    localStorage.setItem('teneraCart', JSON.stringify({ items, timestamp: new Date().toISOString() }));
    console.log('Cart saved to storage successfully');
  } catch (e) {
    console.error('Error saving cart to storage:', e);
  }
};

// Add the missing function that other files are trying to import
export const saveCartToAllStorages = (items: CartItem[]) => {
  saveCartToStorage(items);
};

export const clearCartStorage = () => {
  const keys = [
    'TENERA_CART_UPDATE',
    'teneraCart',
    'systemeCart', 
    'cartItems',
    'pendingOrderData',
    'TeneraShoppingCart',
    'checkoutData'
  ];
  
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key}:`, e);
    }
  });
  
  console.log('Cart storage cleared');
};

// Add the missing function that other files are trying to import
export const clearCartFromAllStorages = () => {
  clearCartStorage();
};
