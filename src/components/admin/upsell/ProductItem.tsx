
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';
import { UpsellProduct } from '@/types/upsell-types';

interface ProductItemProps {
  product: UpsellProduct;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  generatingLink: string | null;
  onUpdate: (product: UpsellProduct) => void;
  onDelete: (id: string) => void;
  onGenerateLink: (product: UpsellProduct) => void;
  onCancelEdit: () => void;
  updateProduct: (id: string, field: keyof UpsellProduct, value: any) => void;
}

const ProductItem = ({
  product,
  editingId,
  setEditingId,
  generatingLink,
  onUpdate,
  onDelete,
  onGenerateLink,
  onCancelEdit,
  updateProduct
}: ProductItemProps) => {
  const isEditing = editingId === product.id;

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
          <Input
            value={product.name}
            onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
            placeholder="Product name"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <Textarea
            value={product.description || ''}
            onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
            placeholder="Product description"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={product.price}
              onChange={(e) => updateProduct(product.id, 'price', Number(e.target.value))}
              placeholder="Price"
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
            <select
              value={product.type}
              onChange={(e) => updateProduct(product.id, 'type', e.target.value)}
              className="p-2 border rounded bg-gray-900 text-white border-gray-700"
            >
              <option value="downsell">Downsell</option>
              <option value="upsell">Upsell</option>
            </select>
            <Input
              type="number"
              value={product.duration_months || ''}
              onChange={(e) => updateProduct(product.id, 'duration_months', Number(e.target.value) || null)}
              placeholder="Duration"
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onUpdate(product)}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-3">
        {product.image && (
          <div className="mb-2 flex justify-center">
            <img src={product.image} alt={product.name} className="h-24 w-24 object-cover rounded-lg border" />
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <Badge variant={product.type === 'upsell' ? 'default' : 'secondary'}>
                {product.type === 'upsell' ? 'Upsell' : 'Downsell'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-lemon-600 lemon-text-glow">₦{product.price.toLocaleString()}</span>
              <span className="text-gray-500">Duration: {product.duration_months || 'N/A'} months</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onGenerateLink(product)}
              disabled={generatingLink === product.id}
              className="bg-lemon-600 hover:bg-lemon-700 lemon-glow"
            >
              {generatingLink === product.id ? (
                'Generating...'
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Generate Payment Link
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingId(product.id)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
