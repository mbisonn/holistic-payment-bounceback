
// This is now just a re-export file for backward compatibility
// Import from new modules and re-export for compatibility
import { 
  validateCartItems, 
  normalizeId, 
  isValidCartItem,
  normalizeCartItem
} from './cart/cartValidationUtils';

import {
  loadCartFromStorage,
  saveCartToAllStorages,
  clearCartFromAllStorages
} from './cart/cartStorageUtils';

// Re-export utility for handling cart messages
import {
  sendReadyMessage,
  handleCartMessage
} from './cartMessageHandler';

// Re-export everything
export {
  validateCartItems,
  normalizeId,
  isValidCartItem,
  normalizeCartItem,
  loadCartFromStorage,
  saveCartToAllStorages,
  clearCartFromAllStorages,
  sendReadyMessage,
  handleCartMessage
};
