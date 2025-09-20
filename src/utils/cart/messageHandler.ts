
import { CartItem } from '@/types/product-types';

export const sendReadyMessage = () => {
  if (typeof window !== 'undefined' && window.parent) {
    try {
      window.parent.postMessage({
        type: 'CHECKOUT_READY',
        data: { ready: true }
      }, '*');
      console.log('[MessageHandler] Sent ready message to parent');
    } catch (error) {
      console.error('[MessageHandler] Error sending ready message:', error);
    }
  }
};

export const handleCartMessage = (
  event: MessageEvent,
  onCartUpdate: (items: CartItem[]) => void
) => {
  if (event.data?.type === 'TENERA_CART_UPDATE') {
    console.log('[MessageHandler] Processing cart update:', event.data);
    
    if (event.data.data?.cartItems && Array.isArray(event.data.data.cartItems)) {
      try {
        // Transform external cart items to our format
        const transformedItems: CartItem[] = event.data.data.cartItems.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || item.title || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          image: item.image || item.imageUrl || undefined,
          description: item.description || undefined
        }));
        
        console.log('[MessageHandler] Transformed cart items:', transformedItems);
        onCartUpdate(transformedItems);
        
        // Store in localStorage for persistence
        localStorage.setItem('externalCart', JSON.stringify(transformedItems));
        localStorage.setItem('externalCheckoutMode', 'true');
        
        // Send acknowledgment back to parent
        if (event.source && typeof event.source.postMessage === 'function') {
          (event.source as Window).postMessage({
            type: 'CART_UPDATE_RECEIVED',
            data: { success: true, itemCount: transformedItems.length }
          }, { targetOrigin: event.origin });
        }
      } catch (error) {
        console.error('[MessageHandler] Error processing cart update:', error);
        
        // Send error back to parent
        if (event.source && typeof event.source.postMessage === 'function') {
          (event.source as Window).postMessage({
            type: 'CART_UPDATE_ERROR',
            data: { error: error instanceof Error ? error.message : 'Unknown error' }
          }, { targetOrigin: event.origin });
        }
      }
    }
  }
};

export const setupCartMessageListener = (onCartUpdate: (items: CartItem[]) => void) => {
  const messageHandler = (event: MessageEvent) => {
    handleCartMessage(event, onCartUpdate);
  };

  window.addEventListener('message', messageHandler);
  
  // Send ready message on setup
  sendReadyMessage();
  
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};
