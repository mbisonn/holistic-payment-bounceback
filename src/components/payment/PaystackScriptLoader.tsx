
import React, { useEffect, useState } from 'react';

interface PaystackScriptLoaderProps {
  children: (scriptLoaded: boolean) => React.ReactNode;
}

const PaystackScriptLoader = ({ children }: PaystackScriptLoaderProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Paystack script
  useEffect(() => {
    const scriptSrc = "https://js.paystack.co/v1/inline.js";
    
    // Check if script is already loaded
    if (document.querySelector(`script[src="${scriptSrc}"]`)) {
      console.log("Paystack script already loaded, setting state");
      setScriptLoaded(true);
      return;
    }

    console.log("Adding Paystack script to document");
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.id = "paystack-script";
    script.async = true;
    
    script.onload = () => {
      console.log("Paystack script loaded successfully");
      setScriptLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error("Error loading Paystack script:", error);
      // Try loading again after a short delay
      setTimeout(() => {
        if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
          document.body.appendChild(script);
        }
      }, 2000);
    };
    
    document.body.appendChild(script);

    return () => {
      // We don't actually want to remove the script on unmount
      // as it might be needed by other components
    };
  }, []);

  console.log("PaystackScriptLoader - Script loaded state:", scriptLoaded);

  return <>{children(scriptLoaded)}</>;
};

export default PaystackScriptLoader;
