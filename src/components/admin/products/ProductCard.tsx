import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '@/utils/products';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const getProductImage = (product: Product) => {
    // If product has an image, use it
    if (product.image && product.image.trim() !== '') {
      // Handle different image URL formats
      const imageUrl = product.image.trim();
      
      // If it's already a full URL, use it
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // If it starts with /, it's a local path
      if (imageUrl.startsWith('/')) {
        return imageUrl;
      }
      
      // Otherwise, assume it's a filename in the public folder
      return `/${imageUrl}`;
    }
    
    // Default placeholder image
    return "/placeholder.svg";
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== "/placeholder.svg") {
      console.warn(`Failed to load image: ${target.src}, falling back to placeholder`);
      target.src = "/placeholder.svg";
    }
  };

  const imageUrl = getProductImage(product);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-800 text-gray-100">
      <div className="aspect-w-16 aspect-h-9 bg-gray-700 relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
            {product.image || 'No image'}
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="truncate">{product.name}</span>
          <Badge variant={product.inStock ? "default" : "outline"} className={product.inStock ? "bg-lemon-700 text-lemon-200 lemon-glow" : "border-gray-500 text-gray-400"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">SKU: {product.sku}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-300">Price:</span>
          <span className="font-bold text-lemon-400 lemon-text-glow">₦{product.price.toLocaleString()}</span>
        </div>
        <p className="text-gray-400 line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-600 text-gray-200 hover:bg-gray-700"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-400 border-red-400 hover:bg-red-900"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
