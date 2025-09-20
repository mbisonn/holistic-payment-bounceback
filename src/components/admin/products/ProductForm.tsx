
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export interface ProductFormValues {
  id?: string;
  name: string;
  sku: string;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  category: string;
  defaultQuantity: number;
  inStock: boolean;
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
}

const ProductForm = ({ defaultValues, onSubmit }: ProductFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      description: '',
      image: '',
      featured: false,
      category: '',
      defaultQuantity: 1,
      inStock: true,
      ...defaultValues
    }
  });

  const featuredValue = watch('featured');
  const inStockValue = watch('inStock');

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-200">Product Name</Label>
          <Input
            id="name"
            {...register('name', { required: 'Product name is required' })}
            placeholder="Enter product name"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku" className="text-gray-200">SKU</Label>
          <Input
            id="sku"
            {...register('sku', { required: 'SKU is required' })}
            placeholder="Enter product SKU"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          {errors.sku && <p className="text-sm text-red-400">{errors.sku.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-gray-200">Price (NGN)</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { required: 'Price is required', min: 0 })}
            placeholder="Enter price"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          {errors.price && <p className="text-sm text-red-400">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-200">Category</Label>
          <Input
            id="category"
            {...register('category')}
            placeholder="Enter category"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-200">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter product description"
          rows={3}
          className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image" className="text-gray-200">Image URL</Label>
        <Input
          id="image"
          {...register('image')}
          placeholder="Enter image URL"
          className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="defaultQuantity" className="text-gray-200">Default Quantity</Label>
          <Input
            id="defaultQuantity"
            type="number"
            {...register('defaultQuantity', { min: 1 })}
            placeholder="Enter default quantity"
            className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={featuredValue}
            onCheckedChange={(checked) => setValue('featured', !!checked)}
          />
          <Label htmlFor="featured" className="text-gray-200">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={inStockValue}
            onCheckedChange={(checked) => setValue('inStock', !!checked)}
          />
          <Label htmlFor="inStock" className="text-gray-200">In Stock</Label>
        </div>
      </div>
      <Button type="submit" className="w-full bg-lemon-800 hover:bg-lemon-900 text-gray-100 lemon-glow">
        Save Product
      </Button>
    </form>
  );
};

export default ProductForm;
