
import React from 'react';

interface PaystackLogoProps {
  className?: string;
}

const PaystackLogo: React.FC<PaystackLogoProps> = ({ className = "h-6" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 120 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue bars representing the Paystack logo */}
      <rect x="10" y="4" width="100" height="4" rx="2" fill="#0EA5E9" />
      <rect x="10" y="10" width="100" height="4" rx="2" fill="#0EA5E9" />
      <rect x="10" y="16" width="100" height="4" rx="2" fill="#0EA5E9" />
      <rect x="10" y="22" width="75" height="4" rx="2" fill="#0EA5E9" />
    </svg>
  );
};

export default PaystackLogo;
