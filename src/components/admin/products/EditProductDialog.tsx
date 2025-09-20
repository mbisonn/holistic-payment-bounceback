
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProductForm, { ProductFormValues } from './ProductForm';
import { Product } from '@/utils/products';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormValues) => void;
  product: Product | null;
}

const EditProductDialog = ({ open, onOpenChange, onSubmit, product }: EditProductDialogProps) => {
  const defaultValues: ProductFormValues = product ? {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    description: product.description || "",
    image: product.image || "",
    featured: product.featured || false,
    category: product.category || "",
    defaultQuantity: product.defaultQuantity || 1,
    inStock: product.inStock || true,
  } : {
    name: "",
    sku: "",
    price: 0,
    description: "",
    image: "",
    featured: false,
    category: "",
    defaultQuantity: 1,
    inStock: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for this product.
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
