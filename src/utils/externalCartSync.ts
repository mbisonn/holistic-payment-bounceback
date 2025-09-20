
import { CartItem } from '@/types/product-types';
import { validateCartItems } from '@/utils/cart/cartValidationUtils';

export interface ExternalCartSyncResult {
  success: boolean;
  items: CartItem[];
  source: string;
  errors?: string[];
}

export class ExternalCartSync {
  private static instance: ExternalCartSync;
  
  static getInstance(): ExternalCartSync {
    if (!ExternalCartSync.instance) {
      ExternalCartSync.instance = new ExternalCartSync();
    }
    return ExternalCartSync.instance;
  }

  syncExternalCart(data: any[]): ExternalCartSyncResult {
    try {
      const validation = validateCartItems(data);
      
      if (validation.isValid && validation.items.length > 0) {
        return {
          success: true,
          items: validation.items,
          source: 'external',
        };
      }
      
      return {
        success: false,
        items: [],
        source: 'external',
        errors: validation.errors
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        source: 'external',
        errors: [`Sync error: ${error}`]
      };
    }
  }
}

export const syncExternalCart = (data: any[]): ExternalCartSyncResult => {
  try {
    const validation = validateCartItems(data);
    
    if (validation.isValid && validation.items.length > 0) {
      return {
        success: true,
        items: validation.items,
        source: 'external',
      };
    }
    
    return {
      success: false,
      items: [],
      source: 'external',
      errors: validation.errors
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      source: 'external',
      errors: [`Sync error: ${error}`]
    };
  }
};

// Additional exports for compatibility
export const syncExternalCartItems = (items: any[]): CartItem[] => {
  const result = syncExternalCart(items);
  return result.success ? result.items : [];
};

export const trackExternalCartData = (data: any): void => {
  console.log('[ExternalCartSync] Tracking cart data:', data);
  // Add analytics tracking here if needed
};

export const getCartAnalytics = () => {
  return {
    totalSyncs: 0,
    successfulSyncs: 0,
    lastSyncTime: null
  };
};
