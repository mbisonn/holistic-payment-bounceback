
-- Fix all remaining Supabase advisor issues

-- 1. Fix function search_path issues for security
CREATE OR REPLACE FUNCTION public.update_user_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Add missing index for product_reviews foreign key to improve performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);

-- 3. Remove unused indexes to improve performance and reduce storage
DROP INDEX IF EXISTS public.idx_users_user_id;
DROP INDEX IF EXISTS public.customer_tag_assignments_tag_id_idx;
DROP INDEX IF EXISTS public.email_campaigns_template_id_idx;
DROP INDEX IF EXISTS public.email_logs_campaign_id_idx;
DROP INDEX IF EXISTS public.email_logs_template_id_idx;
DROP INDEX IF EXISTS public.invoices_order_id_idx;

-- 4. Clean up duplicate foreign key constraints on product_reviews if they exist
ALTER TABLE public.product_reviews DROP CONSTRAINT IF EXISTS fk_product_reviews_product_id;

-- Note: The auth leaked password protection warning needs to be enabled in the Supabase Dashboard
-- under Authentication > Settings > Password Protection. This cannot be fixed via SQL.
