
import { useEffect } from 'react';
import { CartItem } from '@/types/product-types';
import { ToastAPI } from '@/types/toast-types';
import { handleCartMessage, sendReadyMessage } from '@/utils/cartMessageHandler';

export const useCartMessageHandler = (
  updateCart: (items: CartItem[]) => void,
  toast: ToastAPI
) => {
  useEffect(() => {
    console.log("CartMessageHandler - Setting up message event listener");
    
    // First, announce that we're ready to receive cart data
    sendReadyMessage();
    
    // Set up event listener for incoming messages
    const messageHandler = (event: MessageEvent) => {
      handleCartMessage(event, updateCart);
    };
    
    window.addEventListener('message', messageHandler);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [updateCart, toast]);
};

export default useCartMessageHandler;
