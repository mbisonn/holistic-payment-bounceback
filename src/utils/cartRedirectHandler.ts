
/**
 * Utility for handling cart redirects
 */

/**
 * Check URL parameters for redirect instructions
 * Returns an object with redirect information
 */
export const checkForRedirect = (): { 
  shouldRedirect: boolean; 
  redirectUrl: string | null;
  hasDelay: boolean;
  delayTime: number;
} => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRedirect = urlParams.get('redirect') === 'true';
    const redirectUrl = urlParams.get('redirectUrl');
    const delayParam = urlParams.get('delay');
    const delayTime = delayParam ? parseInt(delayParam, 10) : 1500; // Default 1.5 seconds
    
    return {
      shouldRedirect,
      redirectUrl,
      hasDelay: delayParam !== null,
      delayTime: isNaN(delayTime) ? 1500 : delayTime
    };
  } catch (e) {
    console.error('Error checking redirect parameters:', e);
    return {
      shouldRedirect: false,
      redirectUrl: null,
      hasDelay: false,
      delayTime: 1500
    };
  }
};

/**
 * Perform a redirect after optional delay
 */
export const performRedirect = (url: string, delay: number = 0): void => {
  console.log(`Will redirect to ${url}${delay > 0 ? ` after ${delay}ms delay` : ''}`);
  
  if (delay > 0) {
    setTimeout(() => {
      console.log(`Redirecting to ${url} now`);
      window.location.href = url;
    }, delay);
  } else {
    console.log(`Redirecting to ${url} immediately`);
    window.location.href = url;
  }
};

/**
 * Clean URL parameters after processing but preserve redirect information
 */
export const cleanCartUrlParameters = (): void => {
  if (window.history && window.history.replaceState) {
    try {
      const params = new URLSearchParams(window.location.search);
      params.delete('cart');
      params.delete('t'); // Remove timestamp parameter
      
      let cleanUrl = window.location.pathname;
      if (params.toString()) {
        cleanUrl += '?' + params.toString();
      }
      
      window.history.replaceState({}, document.title, cleanUrl);
      console.log("Cleaned URL parameters while preserving redirect info");
    } catch (e) {
      console.error("Error cleaning URL parameters:", e);
    }
  }
};
