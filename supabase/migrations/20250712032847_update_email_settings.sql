
-- Update email_settings table to include missing columns
ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS admin_recipients text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS smtp_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS smtp_username text,
ADD COLUMN IF NOT EXISTS smtp_password text;

-- Update profiles table to include missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS full_name text;

-- Update upsell_products table to include missing columns
ALTER TABLE public.upsell_products 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'membership',
ADD COLUMN IF NOT EXISTS duration_months integer DEFAULT 1;

-- Create shipping_settings table
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_fee numeric NOT NULL DEFAULT 0,
  lagos_delivery_fee numeric NOT NULL DEFAULT 0,
  other_states_delivery_fee numeric NOT NULL DEFAULT 0,
  free_shipping_threshold numeric NOT NULL DEFAULT 0,
  enable_free_shipping boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on shipping_settings
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage shipping settings" ON public.shipping_settings;
CREATE POLICY "Admins can manage shipping settings" 
  ON public.shipping_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Shipping settings are viewable by everyone" 
  ON public.shipping_settings 
  FOR SELECT 
  USING (true);

-- Add trigger for updated_at on shipping_settings
CREATE TRIGGER update_shipping_settings_updated_at
  BEFORE UPDATE ON public.shipping_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
