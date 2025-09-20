import { supabase } from '@/integrations/supabase/client';

interface ShippingSettings {
  id: string;
  name: string;
  description?: string | null;
  base_fee: number;
  lagos_delivery_fee: number;
  other_states_delivery_fee: number;
  free_shipping_threshold: number;
  enable_free_shipping: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get shipping fee based on state and cart items
export const getShippingFee = async (state: string, cartItems: any[] = []): Promise<number> => {
  try {
    // Fetch latest shipping settings from Supabase
    const { data: settings, error } = await supabase
      .from('shipping_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const activeSetting = settings && settings.length > 0 ? settings[0] : null;
    if (!activeSetting) {
      // Fallback to default logic if no settings found
      const isLagos = state?.toLowerCase().includes('lagos');
      return isLagos ? 2000 : 4000;
    }
    // Use settings for calculation
    const isLagos = state?.toLowerCase().includes('lagos');
    const orderTotal = Array.isArray(cartItems) && cartItems.length > 0 ? cartItems.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) : 0;
    if (activeSetting.enable_free_shipping && orderTotal >= activeSetting.free_shipping_threshold) {
      return 0;
    }
    if (isLagos) {
      return activeSetting.lagos_delivery_fee;
    } else {
      return activeSetting.other_states_delivery_fee;
    }
  } catch (error) {
    console.error('Error calculating shipping fee:', error);
    return 2000; // Default Lagos fee
  }
};

// Get all shipping settings
export const getShippingSettings = async (): Promise<ShippingSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('shipping_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    return [];
  }
};

// Update shipping settings
export const updateShippingSettings = async (id: string, updates: Partial<ShippingSettings>): Promise<void> => {
  try {
    // Remove created_at and updated_at from updates to avoid conflicts
    const { created_at, updated_at, ...safeUpdates } = updates;
    
    const { error } = await supabase
      .from('shipping_settings')
      .update(safeUpdates)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    throw error;
  }
};

// Create new shipping setting
export const createShippingSettings = async (settings: Omit<ShippingSettings, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('shipping_settings')
      .insert(settings);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating shipping settings:', error);
    throw error;
  }
};
