import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderBump } from '@/types/order-bump-types';

export const useOrderBumps = () => {
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBumps = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('order_bumps')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        if (fetchError) {
          console.error('Error fetching order bumps:', fetchError);
          setError(fetchError.message);
          return;
        }

        // Transform the data to match the OrderBump interface
        const transformedBumps = (data || []).map((bump: any) => ({
          id: bump.id,
          title: bump.title,
          description: bump.description,
          original_price: bump.original_price,
          discounted_price: bump.discounted_price,
          image: bump.image,
          image_url: bump.image_url,
          discount_percentage: bump.discount_percentage,
          product_id: bump.product_id,
          is_active: bump.is_active,
          created_at: bump.created_at,
          updated_at: bump.updated_at,
          display_condition_type: bump.display_condition_type,
          min_cart_value: bump.min_cart_value,
          required_products: bump.required_products,
          order_position: bump.order_position,
          // Computed property for backward compatibility
          price: bump.discounted_price || bump.original_price,
        }));

        setOrderBumps(transformedBumps);
      } catch (err) {
        console.error('Error in fetchOrderBumps:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBumps();
  }, []);

  return {
    orderBumps,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-fetch logic would go here
    }
  };
};
