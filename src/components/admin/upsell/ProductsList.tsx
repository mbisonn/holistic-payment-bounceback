
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductItem from './ProductItem';
import { UpsellProduct } from '@/types/upsell-types';

interface ProductsListProps {
  products: UpsellProduct[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  generatingLink: string | null;
  onUpdate: (product: UpsellProduct) => void;
  onDelete: (id: string) => void;
  onGenerateLink: (product: UpsellProduct) => void;
  onCancelEdit: () => void;
  updateProduct: (id: string, field: keyof UpsellProduct, value: any) => void;
}

const ProductsList = ({
  products,
  editingId,
  setEditingId,
  generatingLink,
  onUpdate,
  onDelete,
  onGenerateLink,
  onCancelEdit,
  updateProduct
}: ProductsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              editingId={editingId}
              setEditingId={setEditingId}
              generatingLink={generatingLink}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onGenerateLink={onGenerateLink}
              onCancelEdit={onCancelEdit}
              updateProduct={updateProduct}
            />
          ))}
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products created yet. Create your first upsell/downsell product above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsList;
