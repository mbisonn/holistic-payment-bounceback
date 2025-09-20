
/**
 * Utility functions for the cart system
 */

export function log(message, ...args) {
  if (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.DEBUG) {
    console.log(`[Tenera Cart] ${message}`, ...args);
  }
}

/**
 * Show notification to the user
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether this is an error message
 */
export function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = 'tenera-notification';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = isError ? '#e74c3c' : '#27ae60';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1001';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-20px)';
  notification.style.transition = 'all 0.5s ease-in-out';
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="margin-right: 10px; font-size: 20px;">${isError ? '⚠️' : '🛒'}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animation: fade in and slide down
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Auto remove after 3 seconds with smooth animation
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
