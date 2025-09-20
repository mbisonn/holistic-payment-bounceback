
// Re-export functions from the cart utilities
export { sendReadyMessage, handleCartMessage } from './cart/messageHandler';

// Check if we're in external checkout mode
export const isExternalCheckoutMode = (): boolean => {
  return localStorage.getItem('externalCheckoutMode') === 'true';
};

// Legacy function for backward compatibility
export const setupCartMessageHandler = (onCartUpdate: (items: any[]) => void) => {
  const messageHandler = (event: MessageEvent) => {
    if (event.data?.type === 'TENERA_CART_UPDATE') {
      console.log('[CartMessageHandler] Processing cart update:', event.data);
      if (event.data.data?.cartItems) {
        onCartUpdate(event.data.data.cartItems);
      }
    }
  };

  window.addEventListener('message', messageHandler);
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};
