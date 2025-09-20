
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ProductsHeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
}

const ProductsHeader = ({ onAddClick, onImportClick }: ProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-100">Products</h1>
      
      <div className="flex space-x-2">
        <Button onClick={onImportClick} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700">
          Import Products
        </Button>
        <Button onClick={onAddClick} className="bg-lemon-800 hover:bg-lemon-900 text-gray-100 lemon-glow">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductsHeader;
