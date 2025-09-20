
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProductForm, { ProductFormValues } from './ProductForm';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormValues) => void;
}

const AddProductDialog = ({ open, onOpenChange, onSubmit }: AddProductDialogProps) => {
  const handleSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product for your catalog.
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
