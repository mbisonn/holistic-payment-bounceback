
import ProductCard from './ProductCard';
import { Product } from '@/utils/products';

interface ProductsGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  loading?: boolean;
  searchQuery?: string;
}

const ProductsGrid = ({ products, onEdit, onDelete, loading, searchQuery = '' }: ProductsGridProps) => {
  // Filter products based on search query
  const filteredProducts = searchQuery.trim() === '' 
    ? products 
    : products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No products found.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
