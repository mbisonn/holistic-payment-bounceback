
-- Create discount_codes table (idempotent)
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  minimum_amount NUMERIC NULL,
  usage_limit INTEGER NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage discount codes (idempotent)
DROP POLICY IF EXISTS "Admins can manage discount codes" 
  ON public.discount_codes;
CREATE POLICY "Admins can manage discount codes" 
  ON public.discount_codes 
  FOR ALL 
  USING (current_user_is_admin());

-- Add trigger to update updated_at column (idempotent)
DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON public.discount_codes;
CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Also need to add updated_at to customer_tags table if it's missing
ALTER TABLE public.customer_tags 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add trigger to update updated_at column for customer_tags (idempotent)
DROP TRIGGER IF EXISTS update_customer_tags_updated_at ON public.customer_tags;
CREATE TRIGGER update_customer_tags_updated_at
  BEFORE UPDATE ON public.customer_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
