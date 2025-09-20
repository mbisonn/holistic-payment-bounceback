
export interface OrderBump {
  id: string;
  title: string;
  description?: string | null;
  original_price: number;
  discounted_price?: number | null;
  image?: string;
  image_url?: string | null;
  discount_percentage?: number;
  product_id?: string;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  display_condition_type?: string | null;
  min_cart_value?: number | null;
  required_products?: string[] | null;
  order_position?: number | null;
  // Computed property for backward compatibility
  price: number;
}

export interface OrderBumpsSectionProps {
  selectedOrderBumps: Set<string>;
  onOrderBumpToggle: (orderBumpId: string, isSelected: boolean) => void;
}
