
import ProductCard from './ProductCard';
import { Product } from '@/types/product-types';

interface ProductGridProps {
  products: Product[];
  featured?: boolean;
}

const ProductGrid = ({ products, featured = false }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} featured={featured} />
      ))}
    </div>
  );
};

export default ProductGrid;
