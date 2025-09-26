import { useState } from 'react';

// Mock hook since product_variants table doesn't exist
export const useProductVariants = () => {
  const [variants] = useState([]);
  const [loading] = useState(false);

  return {
    variants,
    loading,
    createVariant: async () => {},
    updateVariant: async () => {},
    deleteVariant: async () => {},
  };
};