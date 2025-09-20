import { supabase } from '@/integrations/supabase/client';
import { Product, SuccessResponse } from './types';
import { mapDbProductToProduct } from './mappers';

// Create a new product in the upsell_products table
export const createProduct = async (product: Omit<Product, 'id'>): Promise<SuccessResponse> => {
  try {
    const { data, error } = await supabase
      .from('upsell_products')
      .insert({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '/placeholder.svg',
        type: product.category || 'product', // Required field for upsell_products table
        duration_months: 1 // Required field
      })
      .select()
      .single();

    if (error) throw error;

    const newProduct = mapDbProductToProduct(data);

    return {
      success: true,
      product: newProduct
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Update a product
export const updateProduct = async (product: Product): Promise<SuccessResponse> => {
  try {
    const updateData: Record<string, unknown> = {
      name: product.name,
      description: product.description || '',
      price: product.price
    };
    
    if (product.image) updateData.image = product.image;
    if (product.category) updateData.type = product.category;

    const { data, error } = await supabase
      .from('upsell_products')
      .update(updateData)
      .eq('id', product.id)
      .select()
      .single();

    if (error) throw error;

    const updatedProduct = mapDbProductToProduct(data);

    return {
      success: true,
      product: updatedProduct
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<SuccessResponse> => {
  try {
    const { error } = await supabase
      .from('upsell_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Import products from Systeme.io format
export const importProductsFromSysteme = async (products: unknown[]): Promise<SuccessResponse> => {
  try {
    if (!Array.isArray(products)) {
      return {
        success: false,
        message: 'Invalid products data format'
      };
    }
    
    const processedProducts = products.map(item => ({
      name: (item as any).name,
      description: (item as any).description || '',
      price: (item as any).price,
      image: (item as any).image || '/placeholder.svg',
      type: (item as any).category || 'product',
      duration_months: 1
    }));
    
    const { data, error } = await supabase
      .from('upsell_products')
      .insert(processedProducts)
      .select();
      
    if (error) throw error;
    
    return {
      success: true,
      count: data?.length || 0
    };
  } catch (error) {
    console.error('Error importing products:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
