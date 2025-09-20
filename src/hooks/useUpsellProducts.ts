
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UpsellProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'full' | 'lite';
  duration_months?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUpsellProducts = () => {
  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('upsell_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform upsell_products data to match UpsellProduct interface
      const upsellProducts: UpsellProduct[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        type: (product.type === 'lite' ? 'lite' : 'full') as 'full' | 'lite',
        duration_months: product.duration_months,
        is_active: product.is_active,
        created_at: product.created_at || '',
        updated_at: product.updated_at || ''
      }));

      setProducts(upsellProducts);
    } catch (err: any) {
      console.error('Error fetching upsell products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<UpsellProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('upsell_products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          type: productData.type,
          duration_months: productData.duration_months,
          is_active: productData.is_active
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: UpsellProduct = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        type: (data.type === 'lite' ? 'lite' : 'full') as 'full' | 'lite',
        duration_months: data.duration_months,
        is_active: data.is_active,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      console.error('Error creating upsell product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<UpsellProduct>) => {
    try {
      const { data, error } = await supabase
        .from('upsell_products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          type: updates.type,
          duration_months: updates.duration_months,
          is_active: updates.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: UpsellProduct = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        type: (data.type === 'lite' ? 'lite' : 'full') as 'full' | 'lite',
        duration_months: data.duration_months,
        is_active: data.is_active,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err: any) {
      console.error('Error updating upsell product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('upsell_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting upsell product:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
