
import { useEffect, useState } from 'react';

interface ShippingFeeDisplayProps {
  onFeeChange: (fee: number) => void;
  state?: string;
  orderTotal?: number;
}

export default function ShippingFeeDisplay({ onFeeChange, state, orderTotal }: ShippingFeeDisplayProps) {
  const [fee, setFee] = useState<number>(2500);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getShippingFee = () => {
      try {
        let calculatedFee = 0;

        // Simple shipping calculation based on state and order total
        const freeShippingThreshold = 50000;
        if (orderTotal && orderTotal >= freeShippingThreshold) {
          calculatedFee = 0;
        } else {
          // Calculate based on state
          if (state && state.toLowerCase() === 'lagos') {
            calculatedFee = 2000;
          } else {
            calculatedFee = 5000;
          }
        }

        setFee(calculatedFee);
        onFeeChange(calculatedFee);
      } catch (error) {
        console.error('Error calculating shipping fee:', error);
        setFee(2500);
        onFeeChange(2500);
      } finally {
        setLoading(false);
      }
    };

    getShippingFee();
  }, [state, orderTotal, onFeeChange]);

  if (loading) {
    return <span className="text-gray-500">Calculating...</span>;
  }

  return (
    <span className="text-green-600">
      {fee === 0 ? 'FREE' : `₦${fee.toLocaleString()}`}
    </span>
  );
}
