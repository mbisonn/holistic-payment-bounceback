
import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product-types';
import ProductCard from './ProductCard';
import { getAllProducts } from '@/utils/productUtils';

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Get all products
        const allProducts = await getAllProducts();
        
        // Filter products by category and exclude the current product
        let related: Product[] = allProducts.filter(product => 
          product.id !== currentProductId && 
          (category ? product.category === category : true)
        );
        
        // If we don't have enough related products by category, get some random ones
        if (related.length < 3) {
          const randomProducts = allProducts.filter(product => 
            product.id !== currentProductId && 
            (!category || product.category !== category)
          );
          
          related = [
            ...related,
            ...randomProducts.slice(0, 4 - related.length)
          ];
        }
        
        // Limit to 4 products
        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) {
    return <div className="my-8 animate-pulse">Loading related products...</div>;
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
