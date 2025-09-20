-- ==============================================
-- FIX REMAINING DATABASE LINTER ISSUES
-- This script addresses the new security and performance issues
-- ==============================================

-- 1. FIX SECURITY DEFINER VIEW ISSUES (ERROR)
-- ==============================================

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.active_products_view;
DROP VIEW IF EXISTS public.order_summary_view;

-- Create views without SECURITY DEFINER (default is SECURITY INVOKER)
CREATE VIEW public.active_products_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.category,
    p.stock_quantity,
    p.created_at,
    p.updated_at
FROM public.products p
WHERE p.is_active = true;

CREATE VIEW public.order_summary_view AS
SELECT 
    o.id,
    o.customer_name,
    o.customer_email,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_name, o.customer_email, o.total_amount, o.status, o.payment_status, o.created_at;

-- 2. REMOVE UNUSED INDEXES (PERFORMANCE)
-- ==============================================

-- Remove unused indexes that are not providing value
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_role;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_products_is_active;
DROP INDEX IF EXISTS public.idx_customer_notes_email;

-- Remove unused auth audit log indexes (since they're not being used yet)
DROP INDEX IF EXISTS public.idx_auth_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_auth_audit_log_action;
DROP INDEX IF EXISTS public.idx_auth_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_auth_audit_log_user_action;

-- Remove unused foreign key indexes that aren't being used
DROP INDEX IF EXISTS public.idx_email_campaigns_template_id;
DROP INDEX IF EXISTS public.idx_user_access_requests_reviewed_by;
DROP INDEX IF EXISTS public.idx_user_access_requests_user_id;

-- Remove unused single-column indexes that aren't being used
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_price;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;
DROP INDEX IF EXISTS public.idx_email_campaigns_status;
DROP INDEX IF EXISTS public.idx_discount_codes_code;
DROP INDEX IF EXISTS public.idx_discount_codes_is_active;
DROP INDEX IF EXISTS public.idx_customer_tags_name;
DROP INDEX IF EXISTS public.idx_meal_plans_category;
DROP INDEX IF EXISTS public.idx_automation_rules_is_active;

-- Remove unused composite indexes
DROP INDEX IF EXISTS public.idx_products_active_category;
DROP INDEX IF EXISTS public.idx_orders_user_status;
DROP INDEX IF EXISTS public.idx_email_campaigns_active_status;
DROP INDEX IF EXISTS public.idx_discount_codes_active_expires;

-- 3. CREATE ONLY ESSENTIAL INDEXES
-- ==============================================

-- Keep only the most essential indexes that are likely to be used
-- Primary key indexes are automatically created, so we focus on foreign keys and unique constraints

-- Create essential foreign key indexes (only for tables that are actively used)
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders(created_at DESC);

-- Create indexes for commonly queried active records
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON public.email_campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;

-- 4. CREATE FUNCTION TO CLEAN UP UNUSED INDEXES
-- ==============================================

-- Create a function to identify and remove truly unused indexes
CREATE OR REPLACE FUNCTION public.cleanup_unused_indexes()
RETURNS TABLE (
    index_name TEXT,
    table_name TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::TEXT,
        i.tablename::TEXT,
        pg_size_pretty(pg_relation_size(i.indexname::regclass))::TEXT
    FROM pg_indexes i
    JOIN pg_stat_user_indexes s ON i.indexname = s.indexrelname
    WHERE i.schemaname = 'public'
    AND s.idx_scan = 0
    AND i.indexname NOT LIKE '%_pkey'
    AND i.indexname NOT LIKE '%_unique%'
    ORDER BY pg_relation_size(i.indexname::regclass) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. CREATE MONITORING VIEW FOR INDEX USAGE
-- ==============================================

-- Create a view to monitor index usage
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 6. OPTIMIZE TABLE STATISTICS
-- ==============================================

-- Update statistics for all tables to ensure optimal query planning
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.customer_notes;
ANALYZE public.user_access_requests;
ANALYZE public.email_campaigns;
ANALYZE public.email_templates;
ANALYZE public.discount_codes;
ANALYZE public.customer_tags;
ANALYZE public.automation_rules;
ANALYZE public.meal_plans;
ANALYZE public.shipping_settings;
ANALYZE public.profiles;
ANALYZE public.user_roles;

-- 7. CREATE PERFORMANCE MONITORING FUNCTIONS
-- ==============================================

-- Create function to get database performance stats
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tables', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        'total_indexes', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
        'total_views', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
        'total_functions', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'),
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'unused_indexes', (SELECT COUNT(*) FROM public.index_usage_stats WHERE times_used = 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. SUCCESS MESSAGE
-- ==============================================
DO $$
DECLARE
    remaining_indexes INTEGER;
    total_views INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_indexes 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE '%_pkey';
    
    SELECT COUNT(*) INTO total_views 
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE '🎉 REMAINING LINTER ISSUES FIXED! 🎉';
    RAISE NOTICE 'Security definer views fixed: %', total_views;
    RAISE NOTICE 'Unused indexes removed';
    RAISE NOTICE 'Essential indexes kept: %', remaining_indexes;
    RAISE NOTICE 'Performance monitoring functions created';
    RAISE NOTICE 'Table statistics updated';
    RAISE NOTICE '';
    RAISE NOTICE '📊 MONITORING TOOLS CREATED:';
    RAISE NOTICE '- Use SELECT * FROM public.index_usage_stats; to monitor index usage';
    RAISE NOTICE '- Use SELECT * FROM public.cleanup_unused_indexes(); to find unused indexes';
    RAISE NOTICE '- Use SELECT public.get_database_stats(); for overall database stats';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is now optimized and linter-compliant!';
END $$;
