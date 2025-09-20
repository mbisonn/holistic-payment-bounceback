
export const sendReadyMessage = () => {
  const readyMessage = {
    type: 'CART_READY',
    timestamp: new Date().toISOString(),
    source: 'lovable_app'
  };
  
  console.log('[MessageSender] Sending CART_READY message');
  
  try {
    window.postMessage(readyMessage, '*');
    
    // Also send to parent window if in iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(readyMessage, '*');
      
      // Send iframe ready signal for custom checkout integration
      window.parent.postMessage({
        type: 'IFRAME_READY',
        timestamp: new Date().toISOString(),
        source: 'lovable_app'
      }, '*');
    }
  } catch (error) {
    console.log('[MessageSender] Message sending failed (expected in some contexts):', error instanceof Error ? error.message : 'Unknown error');
  }
};

export const sendCartReceivedMessage = (itemCount: number) => {
  const message = {
    type: 'CART_RECEIVED',
    success: true,
    itemCount,
    timestamp: new Date().toISOString()
  };
  
  try {
    window.postMessage(message, '*');
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  } catch (error) {
    console.log('[MessageSender] Error sending cart received message:', error instanceof Error ? error.message : 'Unknown error');
  }
};
