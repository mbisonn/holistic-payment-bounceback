
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderBump } from '@/types/order-bump-types';

export const useOrderBumps = () => {
  const { data: orderBumps = [], isLoading, error } = useQuery({
    queryKey: ['order-bumps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_bumps')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our OrderBump interface
      return (data || []).map((item): OrderBump => ({
        id: item.id,
        title: item.title,
        description: item.description,
        original_price: item.original_price,
        discounted_price: item.discounted_price,
        price: item.discounted_price || item.original_price, // Use discounted price if available, otherwise original
        image_url: item.image_url,
        discount_percentage: item.discounted_price ? Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100) : 0,
        product_id: item.id,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        display_condition_type: null,
        min_cart_value: null,
        required_products: null,
        order_position: null
      }));
    },
  });

  return { orderBumps, isLoading, error };
};
