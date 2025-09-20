
/**
 * Main integration script for Tenera Holistic & Wellness sales page
 * This file orchestrates the integration and loads all required components
 */

// Import the core modules
import { initializeCheckout } from './checkout.js';
import { setupEventListeners } from './eventListeners.js';
import { CONFIG } from './config.js';

// Log when the script loads
console.log("Tenera sales page integration script loading...");

// Self-executing initialization function
(function() {
  try {
    // Load checkout.js script dynamically
    const checkoutScript = document.createElement('script');
    checkoutScript.src = 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com/checkout.js';
    checkoutScript.async = true;
    document.head.appendChild(checkoutScript);

    // Wait for script to load properly
    checkoutScript.onload = function() {
      console.log("Checkout script loaded successfully");
      
      // Initialize the checkout functionality
      initializeCheckout(CONFIG);
      
      // Set up event listeners for messages
      setupEventListeners(CONFIG);
    };
    
    // Handle script load errors
    checkoutScript.onerror = function() {
      console.error("Failed to load checkout.js");
      
      // Initialize fallback checkout functionality
      initializeCheckout(CONFIG, true);
    };
  } catch (e) {
    console.error("Error initializing sales page integration:", e);
  }
})();
