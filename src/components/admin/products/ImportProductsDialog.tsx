
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: string) => void;
  onImportComplete?: () => Promise<void>;
}

const ImportProductsDialog = ({ open, onOpenChange, onSubmit, onImportComplete }: ImportProductsDialogProps) => {
  const [importData, setImportData] = useState('');

  const handleSubmit = async () => {
    onSubmit(importData);
    setImportData('');
    if (onImportComplete) {
      await onImportComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Import products from JSON data. Paste your product data below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importData">Product Data (JSON)</Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='[{"name": "Product Name", "sku": "SKU123", "price": 1000, "description": "Product description"}]'
              rows={10}
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!importData.trim()}>
            Import Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
