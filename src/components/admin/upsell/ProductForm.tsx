
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface ProductFormProps {
  newProduct: {
    name: string;
    description: string;
    price: number;
    type: string;
    duration_months: number;
  };
  setNewProduct: (product: any) => void;
  onSubmit: () => void;
}

const ProductForm = ({ newProduct, setNewProduct, onSubmit }: ProductFormProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <Textarea
            placeholder="Product description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
            <select
              value={newProduct.type}
              onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
              className="p-2 border rounded bg-gray-900 text-white border-gray-700"
            >
              <option value="downsell">Downsell</option>
              <option value="upsell">Upsell</option>
            </select>
            <Input
              type="number"
              placeholder="Duration (months)"
              value={newProduct.duration_months}
              onChange={(e) => setNewProduct({ ...newProduct, duration_months: Number(e.target.value) })}
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
          </div>
          <Button onClick={onSubmit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
