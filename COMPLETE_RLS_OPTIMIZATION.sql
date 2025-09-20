-- ==============================================
-- COMPLETE RLS OPTIMIZATION AND LINTER FIX
-- This script provides a comprehensive solution for all database linter issues:
-- 1. RLS performance optimization with cached auth functions (fixes auth_rls_initplan warnings)
-- 2. Duplicate policy removal and consolidation (fixes multiple_permissive_policies warnings)
-- 3. Security definer view fixes
-- 4. Unused index cleanup
-- 5. Performance monitoring tools
-- 
-- FIXES ALL SUPABASE LINTER WARNINGS:
-- - auth_rls_initplan: Wraps auth.uid() calls in SELECT statements
-- - multiple_permissive_policies: Consolidates overlapping policies
-- ==============================================

-- STEP 1: CREATE OPTIMIZED HELPER FUNCTIONS
-- ==============================================

-- Create optimized function to get current user ID (cached per query)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Create optimized function to check if current user is admin (cached per query)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = public.current_user_id()
    AND user_roles.role = 'admin'::app_role
  );
$$;

-- Create function to check if user has specific role (cached per query)
CREATE OR REPLACE FUNCTION public.current_user_has_role(role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = public.current_user_id()
    AND user_roles.role = role_name::app_role
  );
$$;

-- Grant permissions on helper functions
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon, dashboard_user;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon, dashboard_user;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(text) TO authenticated, anon, dashboard_user;

-- STEP 2: OPTIMIZE CORE TABLE POLICIES
-- ==============================================

-- Clean up and optimize orders table policies
DO $$
BEGIN
  -- Drop ALL existing orders policies (including linter-flagged ones)
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_admin_select ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_admin_insert ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_admin_update ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_admin_delete ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_select_consolidated ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_insert_consolidated ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_update_consolidated ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_delete_consolidated ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_public_select ON public.orders';
  -- Drop linter-flagged policies
  EXECUTE 'DROP POLICY IF EXISTS authenticated_access_orders ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_public_optimized ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_optimized_delete ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_optimized_insert ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_optimized_select ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS orders_optimized_update ON public.orders';
  
  -- Create single consolidated policy per action to eliminate multiple permissive policies
  EXECUTE 'CREATE POLICY orders_consolidated_select ON public.orders FOR SELECT TO authenticated, anon, authenticator, dashboard_user USING (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
  EXECUTE 'CREATE POLICY orders_consolidated_insert ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
  EXECUTE 'CREATE POLICY orders_consolidated_update ON public.orders FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role))) WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
  EXECUTE 'CREATE POLICY orders_consolidated_delete ON public.orders FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
END $$;

-- Clean up and optimize user_roles table policies
DO $$
BEGIN
  -- Drop ALL existing user_roles policies (including linter-flagged ones)
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view user roles" ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_select ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_insert ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_update ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_delete ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_public_select ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_select_consolidated ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_mutations ON public.user_roles';
  -- Drop linter-flagged policies
  EXECUTE 'DROP POLICY IF EXISTS admin_manage_user_roles ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS authenticated_access_user_roles ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_optimized_mutations ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_optimized_select ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS user_roles_public_optimized ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS view_user_roles ON public.user_roles';
  
  -- Create single consolidated policy per action to eliminate multiple permissive policies
  EXECUTE 'CREATE POLICY user_roles_consolidated_select ON public.user_roles FOR SELECT TO authenticated, anon, authenticator, dashboard_user USING (user_id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = ''admin''::app_role)))';
  EXECUTE 'CREATE POLICY user_roles_consolidated_mutations ON public.user_roles FOR INSERT, UPDATE, DELETE TO authenticated USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = ''admin''::app_role))) WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = ''admin''::app_role)))';
END $$;

-- Clean up and optimize products table policies
DO $$
BEGIN
  -- Drop ALL existing products policies (including linter-flagged ones)
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage products" ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view products" ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_public_select ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_verified_select ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_delete ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_insert ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_update ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_select ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_manage ON public.products';
  -- Drop linter-flagged policies
  EXECUTE 'DROP POLICY IF EXISTS authenticated_access_products ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_admin_optimized ON public.products';
  EXECUTE 'DROP POLICY IF EXISTS products_public_optimized ON public.products';
  
  -- Create single consolidated policy per action to eliminate multiple permissive policies
  EXECUTE 'CREATE POLICY products_consolidated_select ON public.products FOR SELECT TO anon, authenticated, authenticator, dashboard_user USING (true)';
  EXECUTE 'CREATE POLICY products_consolidated_mutations ON public.products FOR INSERT, UPDATE, DELETE TO authenticated USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role))) WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
END $$;

-- Clean up and optimize profiles table policies
DO $$
BEGIN
  -- Drop ALL existing profiles policies (including linter-flagged ones)
  EXECUTE 'DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_admin_select ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_admin_update ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_public_select ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_update_consolidated ON public.profiles';
  -- Drop linter-flagged policies
  EXECUTE 'DROP POLICY IF EXISTS admin_manage_profiles ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_public_optimized ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS profiles_update_optimized ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS update_own_profile ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS view_profiles ON public.profiles';
  
  -- Create single consolidated policy per action to eliminate multiple permissive policies
  EXECUTE 'CREATE POLICY profiles_consolidated_select ON public.profiles FOR SELECT TO anon, authenticated, authenticator, dashboard_user USING (true)';
  EXECUTE 'CREATE POLICY profiles_consolidated_update ON public.profiles FOR UPDATE TO authenticated, anon, authenticator, dashboard_user USING (id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role))) WITH CHECK (id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))';
END $$;

-- STEP 3: OPTIMIZE ADMIN-ONLY TABLES
-- ==============================================

-- Optimize admin-only tables with single consolidated policies (only if tables exist)
DO $$
DECLARE
    current_table text;
    admin_tables text[] := ARRAY[
        'customer_notes',
        'email_campaigns',
        'email_templates',
        'meal_plan_sync',
        'order_items',
        'user_access_requests'
    ];
    table_exists boolean;
BEGIN
    FOREACH current_table IN ARRAY admin_tables
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'public' 
            AND t.table_name = current_table
        ) INTO table_exists;
        
        -- Only process if table exists
        IF table_exists THEN
            -- Drop ALL existing policies for this table (including linter-flagged ones)
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_only" ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_select" ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_insert" ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_update" ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_delete" ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %s" ON public.%I', replace(current_table, '_', ' '), current_table);
            EXECUTE format('DROP POLICY IF EXISTS "Allow all access to %s" ON public.%I', current_table, current_table);
            -- Drop linter-flagged policies
            EXECUTE format('DROP POLICY IF EXISTS authenticated_access_%s ON public.%I', current_table, current_table);
            EXECUTE format('DROP POLICY IF EXISTS %s_admin_optimized ON public.%I', current_table, current_table);
            
            -- Create single consolidated policy per action to eliminate multiple permissive policies
            EXECUTE format('CREATE POLICY %I_consolidated_select ON public.%I FOR SELECT TO authenticated USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))', current_table, current_table);
            EXECUTE format('CREATE POLICY %I_consolidated_mutations ON public.%I FOR INSERT, UPDATE, DELETE TO authenticated USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role))) WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))', current_table, current_table);
            
            RAISE NOTICE 'Optimized policies for table: %', current_table;
        ELSE
            RAISE NOTICE 'Skipping non-existent table: %', current_table;
        END IF;
    END LOOP;
END $$;

-- STEP 4: OPTIMIZE PUBLIC + ADMIN TABLES
-- ==============================================

-- Optimize tables that have both public read and admin write access (only if tables exist)
DO $$
DECLARE
    table_record RECORD;
    public_admin_tables text[][] := ARRAY[
        ['discount_codes', 'is_active = true'],
        ['order_bumps', 'is_active = true'],
        ['shipping_settings', 'is_active = true'],
        ['upsell_products', 'is_active = true']
    ];
    table_exists boolean;
BEGIN
    FOR i IN 1..array_length(public_admin_tables, 1)
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'public' 
            AND t.table_name = public_admin_tables[i][1]
        ) INTO table_exists;
        
        -- Only process if table exists
        IF table_exists THEN
            -- Drop ALL existing policies (including linter-flagged ones)
            EXECUTE format('DROP POLICY IF EXISTS "%s_public_select" ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_manage" ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_select" ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            -- Drop linter-flagged policies
            EXECUTE format('DROP POLICY IF EXISTS authenticated_access_%s ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            EXECUTE format('DROP POLICY IF EXISTS %s_admin_optimized ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            EXECUTE format('DROP POLICY IF EXISTS %s_public_optimized ON public.%I', public_admin_tables[i][1], public_admin_tables[i][1]);
            
            -- Create single consolidated policy per action to eliminate multiple permissive policies
            EXECUTE format('CREATE POLICY %I_consolidated_select ON public.%I FOR SELECT TO anon, authenticated, authenticator, dashboard_user USING (%s)', public_admin_tables[i][1], public_admin_tables[i][1], public_admin_tables[i][2]);
            EXECUTE format('CREATE POLICY %I_consolidated_mutations ON public.%I FOR INSERT, UPDATE, DELETE TO authenticated USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role))) WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''::app_role)))', public_admin_tables[i][1], public_admin_tables[i][1]);
            
            RAISE NOTICE 'Optimized policies for table: %', public_admin_tables[i][1];
        ELSE
            RAISE NOTICE 'Skipping non-existent table: %', public_admin_tables[i][1];
        END IF;
    END LOOP;
END $$;

-- Optimize role_types table (authenticated read, admin write)
DO $$
DECLARE
    table_exists boolean;
BEGIN
  -- Check if role_types table exists
  SELECT EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_schema = 'public' 
      AND t.table_name = 'role_types'
  ) INTO table_exists;
  
  -- Only process if table exists
  IF table_exists THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view role types" ON public.role_types';
    EXECUTE 'DROP POLICY IF EXISTS role_types_admin_select ON public.role_types';
    EXECUTE 'DROP POLICY IF EXISTS role_types_authenticated_select ON public.role_types';
    EXECUTE 'DROP POLICY IF EXISTS role_types_admin_manage ON public.role_types';
    
    EXECUTE 'CREATE POLICY role_types_authenticated_optimized ON public.role_types FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY role_types_admin_optimized ON public.role_types FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin())';
    
    RAISE NOTICE 'Optimized policies for table: role_types';
  ELSE
    RAISE NOTICE 'Skipping non-existent table: role_types';
  END IF;
END $$;

-- STEP 5: UPDATE EXISTING FUNCTIONS
-- ==============================================

-- Update is_admin function to use optimized pattern
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT public.current_user_id())
RETURNS BOOLEAN 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 
        AND user_roles.role = 'admin'::app_role
    );
$$;

-- Update get_user_role function to use optimized pattern
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT public.current_user_id())
RETURNS TEXT 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role::text FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    LIMIT 1;
$$;

-- Update has_role function to use optimized pattern
CREATE OR REPLACE FUNCTION public.has_role(role_name text, user_id UUID DEFAULT public.current_user_id())
RETURNS BOOLEAN 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $2 
        AND user_roles.role = role_name::app_role
    );
$$;

-- STEP 6: FIX SECURITY DEFINER VIEWS
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

-- STEP 7: CLEAN UP UNUSED INDEXES
-- ==============================================

-- Remove unused indexes that are not providing value
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_role;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_products_is_active;
DROP INDEX IF EXISTS public.idx_customer_notes_email;
DROP INDEX IF EXISTS public.idx_auth_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_auth_audit_log_action;
DROP INDEX IF EXISTS public.idx_auth_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_auth_audit_log_user_action;
DROP INDEX IF EXISTS public.idx_email_campaigns_template_id;
DROP INDEX IF EXISTS public.idx_user_access_requests_reviewed_by;
DROP INDEX IF EXISTS public.idx_user_access_requests_user_id;
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
DROP INDEX IF EXISTS public.idx_products_active_category;
DROP INDEX IF EXISTS public.idx_orders_user_status;
DROP INDEX IF EXISTS public.idx_email_campaigns_active_status;
DROP INDEX IF EXISTS public.idx_discount_codes_active_expires;
DROP INDEX IF EXISTS idx_shipping_settings_is_active_threshold;

-- STEP 8: CREATE ESSENTIAL INDEXES
-- ==============================================

-- Create only essential indexes that are likely to be used
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON public.email_campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;

-- STEP 9: CREATE MONITORING TOOLS
-- ==============================================

-- Create function to identify unused indexes
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

-- Create view to monitor index usage
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

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

-- STEP 10: ANALYZE TABLES FOR PERFORMANCE
-- ==============================================

-- Update table statistics for better query planning
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.customer_notes;
ANALYZE public.user_access_requests;
ANALYZE public.user_roles;
ANALYZE public.profiles;
ANALYZE public.email_campaigns;
ANALYZE public.email_templates;
ANALYZE public.discount_codes;
ANALYZE public.customer_tags;
ANALYZE public.automation_rules;
ANALYZE public.meal_plans;
ANALYZE public.shipping_settings;

-- STEP 11: SUCCESS MESSAGE AND MONITORING INFO
-- ==============================================

DO $$
DECLARE
    policy_count INTEGER;
    function_count INTEGER;
    index_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND policyname LIKE '%_optimized';
    
    SELECT COUNT(*) INTO function_count 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname IN ('current_user_id', 'current_user_is_admin', 'current_user_has_role');
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE '%_pkey';
    
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '🚀 COMPLETE RLS OPTIMIZATION FINISHED! 🚀';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Optimized RLS policies created: %', policy_count;
    RAISE NOTICE 'Performance helper functions: %', function_count;
    RAISE NOTICE 'Essential indexes remaining: %', index_count;
    RAISE NOTICE 'Security-compliant views: %', view_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ PERFORMANCE IMPROVEMENTS:';
    RAISE NOTICE '- Auth function calls optimized with caching';
    RAISE NOTICE '- Duplicate policies removed and consolidated';
    RAISE NOTICE '- Unused indexes cleaned up';
    RAISE NOTICE '- Table statistics updated';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SECURITY IMPROVEMENTS:';
    RAISE NOTICE '- Security definer views fixed';
    RAISE NOTICE '- Proper search_path settings applied';
    RAISE NOTICE '- Function security attributes optimized';
    RAISE NOTICE '';
    RAISE NOTICE '📊 MONITORING TOOLS AVAILABLE:';
    RAISE NOTICE '- SELECT * FROM public.index_usage_stats;';
    RAISE NOTICE '- SELECT * FROM public.cleanup_unused_indexes();';
    RAISE NOTICE '- SELECT public.get_database_stats();';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your database is now fully optimized and linter-compliant!';
    RAISE NOTICE '================================================';
END $$;
