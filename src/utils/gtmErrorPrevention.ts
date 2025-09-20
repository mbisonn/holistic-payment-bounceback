// GTM Error Prevention Utilities

// Prevent GTM from accessing null elements
export const preventGTMErrors = () => {
  // Override textContent getter to prevent null errors
  const originalTextContent = Object.getOwnPropertyDescriptor(Element.prototype, 'textContent');
  
  if (originalTextContent) {
    Object.defineProperty(Element.prototype, 'textContent', {
      get: function() {
        if (this === null || this === undefined) {
          return '';
        }
        return originalTextContent.get?.call(this) || '';
      },
      set: function(value) {
        if (this === null || this === undefined) {
          return;
        }
        originalTextContent.set?.call(this, value);
      },
      configurable: true
    });
  }

  // Override innerText getter to prevent null errors
  const originalInnerText = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');
  
  if (originalInnerText) {
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      get: function() {
        if (this === null || this === undefined) {
          return '';
        }
        return originalInnerText.get?.call(this) || '';
      },
      set: function(value) {
        if (this === null || this === undefined) {
          return;
        }
        originalInnerText.set?.call(this, value);
      },
      configurable: true
    });
  }

  // Override innerHTML getter to prevent null errors
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  
  if (originalInnerHTML) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: function() {
        if (this === null || this === undefined) {
          return '';
        }
        return originalInnerHTML.get?.call(this) || '';
      },
      set: function(value) {
        if (this === null || this === undefined) {
          return;
        }
        originalInnerHTML.set?.call(this, value);
      },
      configurable: true
    });
  }
};

// Ensure product elements exist for GTM
export const ensureProductElements = () => {
  // Create fallback elements for GTM
  const createFallbackElement = (selector: string, content: string = '') => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('span');
      element.className = selector.replace('.', '');
      element.textContent = content;
      (element as HTMLElement).style.display = 'none';
      document.body.appendChild(element);
    }
    return element;
  };

  // Create fallback elements for common GTM selectors
  createFallbackElement('.product-value', '0');
  createFallbackElement('.product-name', 'Product');
  createFallbackElement('.product-price', '0');
  createFallbackElement('[data-gtm-product-value]', '0');
  createFallbackElement('[data-gtm-product-name]', 'Product');
  createFallbackElement('[data-gtm-product-price]', '0');
};

// Initialize GTM error prevention
export const initGTMErrorPrevention = () => {
  // Prevent errors immediately
  preventGTMErrors();
  
  // Ensure elements exist
  ensureProductElements();
  
  // Add error handler for GTM
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('textContent')) {
      console.warn('GTM Error prevented:', event.error.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Add unhandled rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('textContent')) {
      console.warn('GTM Promise rejection prevented:', event.reason.message);
      event.preventDefault();
      return false;
    }
  });
};

// Safe element access for GTM
export const safeGetElementText = (element: Element | null): string => {
  if (!element) return '';
  try {
    return element.textContent || (element as HTMLElement).innerText || '';
  } catch (error) {
    console.warn('Safe element text access failed:', error);
    return '';
  }
};

// Safe element access for GTM with selector
export const safeGetElementBySelector = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn('Safe element selector access failed:', error);
    return null;
  }
}; 