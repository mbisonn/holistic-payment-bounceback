
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Product, 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  importProductsFromSysteme 
} from '@/utils/products';

export const useProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error loading products",
        description: "There was a problem loading your products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProduct = async (data: Omit<Product, 'id'>) => {
    try {
      const result = await createProduct(data);
      
      if (result.success && result.product) {
        toast({
          title: "Product created",
          description: "Your product has been created successfully.",
        });
        
        // Add to local state
        setProducts([...products, result.product]);
        return true;
      } else {
        toast({
          title: "Failed to create product",
          description: result.message || "Unknown error",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the product.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleEditProduct = async (data: Product) => {
    if (!data.id) {
      toast({
        title: "Error",
        description: "Missing product ID",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const result = await updateProduct(data);
      
      if (result.success) {
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        });
        
        // Update local state
        setProducts(products.map(p => p.id === data.id ? {...p, ...data} : p));
        return true;
      } else {
        toast({
          title: "Failed to update product",
          description: result.message || "Unknown error",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the product.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        toast({
          title: "Product deleted",
          description: "Your product has been deleted successfully.",
        });
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        return true;
      } else {
        toast({
          title: "Failed to delete product",
          description: result.message || "Unknown error",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the product.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleImportProducts = async (importData: string) => {
    try {
      let dataToImport = [];
      
      // Clean the input data
      const cleanedData = importData.trim();
      
      if (!cleanedData) {
        toast({
          title: "Empty data",
          description: "Please provide some data to import.",
          variant: "destructive",
        });
        return false;
      }
      
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(cleanedData);
        
        // Handle different formats
        if (Array.isArray(parsed)) {
          dataToImport = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Handle object with product IDs as keys
          if (Object.keys(parsed).length > 0) {
            dataToImport = Object.values(parsed);
          } else {
            throw new Error("Invalid object format");
          }
        } else {
          throw new Error("Data must be an array or object");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        toast({
          title: "Invalid JSON format",
          description: "Please check your JSON syntax and try again.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!Array.isArray(dataToImport) || dataToImport.length === 0) {
        toast({
          title: "No products found",
          description: "The provided data doesn't contain any valid products.",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate product structure - removed description requirement as requested
      const validProducts = dataToImport.filter(item => {
        return item && 
               typeof item === 'object' && 
               (item.name || item.title) && 
               (item.price || item.price === 0) &&
               item.sku;
      });
      
      if (validProducts.length === 0) {
        toast({
          title: "No valid products",
          description: "None of the products have the required fields (name, sku, and price).",
          variant: "destructive",
        });
        return false;
      }
      
      const result = await importProductsFromSysteme(validProducts);
      
      if (result.success) {
        toast({
          title: "Products imported",
          description: `${result.count || validProducts.length} product(s) imported successfully.`,
        });
        
        // Refresh products
        fetchProducts();
        return true;
      } else {
        toast({
          title: "Import failed",
          description: result.message || "Unknown error occurred during import",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Import error",
        description: "There was a problem importing the products. Please check the data format.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    products,
    loading,
    currentProduct,
    setCurrentProduct,
    fetchProducts,
    addProduct: handleAddProduct,
    editProduct: handleEditProduct,
    deleteProduct: handleDeleteProduct,
    importProducts: handleImportProducts
  };
};
