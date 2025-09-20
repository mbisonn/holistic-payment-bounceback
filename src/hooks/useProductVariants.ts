import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductVariant } from '@/types/product-types';

export const useProductVariants = (productId?: string) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('product_variants')
        .select('*')
        .order('quantity_multiplier', { ascending: true });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to match ProductVariant interface
      const transformedData: ProductVariant[] = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        description: item.description || undefined,
        price: item.price,
        quantity_multiplier: item.quantity_multiplier,
        is_bumper_offer: item.is_bumper_offer || false,
        created_at: item.created_at || undefined,
        updated_at: item.updated_at || undefined,
      }));

      setVariants(transformedData);
    } catch (err) {
      console.error('Error fetching product variants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  return { variants, loading, error, refetch: fetchVariants };
};