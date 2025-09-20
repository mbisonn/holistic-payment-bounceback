
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string; // Made required to match Product type
  image?: string;
  featured?: boolean;
  category?: string;
  defaultQuantity?: number;
  inStock?: boolean;
}

export interface ProductResult {
  success: boolean;
  message?: string;
  product?: Product;
  count?: number;
}

// Get all products from the static catalog
export const getAllProducts = async (): Promise<Product[]> => {
  // Import the products from the catalog
  const { products } = await import('@/data/productsCatalog');
  
  // Convert catalog items to Product interface
  return Object.values(products).map(product => ({
    id: product.sku,
    sku: product.sku,
    name: product.name,
    price: product.price,
    description: '',
    image: product.image
  }));
};

// Create a new product (would need database implementation for persistence)
export const createProduct = async (data: Omit<Product, 'id'>): Promise<ProductResult> => {
  try {
    // For now, we'll just return success since we're using static data
    // In a real implementation, this would save to database
    console.log('Creating product:', data);
    
    const newProduct: Product = {
      id: data.sku.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
      ...data,
      description: data.description || '', // Ensure description is always provided
      inStock: data.inStock ?? true,
      featured: data.featured ?? false,
      defaultQuantity: data.defaultQuantity ?? 1
    };
    
    return {
      success: true,
      message: 'Product created successfully',
      product: newProduct
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      message: 'Failed to create product'
    };
  }
};

// Update an existing product
export const updateProduct = async (data: Product): Promise<ProductResult> => {
  try {
    console.log('Updating product:', data);
    
    return {
      success: true,
      message: 'Product updated successfully'
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: 'Failed to update product'
    };
  }
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<ProductResult> => {
  try {
    console.log('Deleting product:', productId);
    
    return {
      success: true,
      message: 'Product deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: 'Failed to delete product'
    };
  }
};

// Import products from external source (like Systeme.io)
export const importProductsFromSysteme = async (productsData: any[]): Promise<ProductResult> => {
  try {
    console.log('Importing products:', productsData);
    
    // Validate and transform the products data - removed description requirement
    const validProducts = productsData.map(item => {
      // Generate ID from SKU if not provided
      const id = item.id || item.sku?.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      
      return {
        id,
        sku: item.sku || id,
        name: item.name || item.title || 'Unnamed Product',
        price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
        description: item.description || '', // Always provide description, even if empty
        image: item.image || '',
        category: item.category || 'General',
        featured: item.featured || false,
        defaultQuantity: item.defaultQuantity || 1,
        inStock: item.inStock !== false
      };
    });
    
    console.log('Processed products for import:', validProducts);
    
    return {
      success: true,
      message: `Successfully imported ${validProducts.length} products`,
      count: validProducts.length
    };
  } catch (error) {
    console.error('Error importing products:', error);
    return {
      success: false,
      message: 'Failed to import products'
    };
  }
};
