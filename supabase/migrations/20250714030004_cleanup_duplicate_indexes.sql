
-- Remove duplicate indexes to improve performance and reduce storage usage

DROP INDEX IF EXISTS public.customer_tag_assignments_tag_id_idx1;
DROP INDEX IF EXISTS public.email_campaigns_template_id_idx1;
DROP INDEX IF EXISTS public.email_logs_campaign_id_idx1;
DROP INDEX IF EXISTS public.email_logs_template_id_idx1;
DROP INDEX IF EXISTS public.invoices_order_id_idx1;
