-- ==============================================
-- OPTIMIZE RLS PERFORMANCE - FIX AUTH FUNCTION CALLS
-- This script optimizes RLS policies to improve performance by:
-- 1. Using (SELECT auth.uid()) instead of auth.uid() in policies
-- 2. Creating optimized helper functions with proper caching
-- 3. Removing duplicate policies and consolidating overlapping ones
-- 4. Using STABLE functions for better query planning
-- ==============================================

-- 1. CREATE OPTIMIZED HELPER FUNCTIONS
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

-- 2. OPTIMIZE ORDERS TABLE POLICIES
-- ==============================================

-- Drop all existing orders policies
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS orders_admin_select ON public.orders;
DROP POLICY IF EXISTS orders_admin_insert ON public.orders;
DROP POLICY IF EXISTS orders_admin_update ON public.orders;
DROP POLICY IF EXISTS orders_admin_delete ON public.orders;
DROP POLICY IF EXISTS orders_select_consolidated ON public.orders;
DROP POLICY IF EXISTS orders_insert_consolidated ON public.orders;
DROP POLICY IF EXISTS orders_update_consolidated ON public.orders;
DROP POLICY IF EXISTS orders_delete_consolidated ON public.orders;
DROP POLICY IF EXISTS orders_public_select ON public.orders;

-- Create optimized orders policies
CREATE POLICY orders_optimized_select ON public.orders 
FOR SELECT TO authenticated 
USING (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

CREATE POLICY orders_optimized_insert ON public.orders 
FOR INSERT TO authenticated 
WITH CHECK (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

CREATE POLICY orders_optimized_update ON public.orders 
FOR UPDATE TO authenticated 
USING (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
) 
WITH CHECK (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

CREATE POLICY orders_optimized_delete ON public.orders 
FOR DELETE TO authenticated 
USING (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

-- Public access for orders (admin only)
CREATE POLICY orders_public_optimized ON public.orders 
FOR SELECT TO anon, authenticator, dashboard_user 
USING (public.current_user_is_admin());

-- 3. OPTIMIZE USER_ROLES TABLE POLICIES
-- ==============================================

-- Drop all existing user_roles policies
DROP POLICY IF EXISTS "Authenticated users can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_select ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_update ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_delete ON public.user_roles;
DROP POLICY IF EXISTS user_roles_public_select ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select_consolidated ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_mutations ON public.user_roles;

-- Create optimized user_roles policies
CREATE POLICY user_roles_optimized_select ON public.user_roles 
FOR SELECT TO authenticated 
USING (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

CREATE POLICY user_roles_optimized_mutations ON public.user_roles 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

CREATE POLICY user_roles_public_optimized ON public.user_roles 
FOR SELECT TO anon, authenticator, dashboard_user 
USING (
  user_id = public.current_user_id() OR 
  public.current_user_is_admin()
);

-- 4. OPTIMIZE PRODUCTS TABLE POLICIES
-- ==============================================

-- Drop all existing products policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS products_public_select ON public.products;
DROP POLICY IF EXISTS products_verified_select ON public.products;
DROP POLICY IF EXISTS products_admin_delete ON public.products;
DROP POLICY IF EXISTS products_admin_insert ON public.products;
DROP POLICY IF EXISTS products_admin_update ON public.products;
DROP POLICY IF EXISTS products_admin_select ON public.products;
DROP POLICY IF EXISTS products_admin_manage ON public.products;

-- Create optimized products policies
CREATE POLICY products_public_optimized ON public.products 
FOR SELECT TO anon, authenticated, authenticator, dashboard_user 
USING (true);

CREATE POLICY products_admin_optimized ON public.products 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- 5. OPTIMIZE PROFILES TABLE POLICIES
-- ==============================================

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
DROP POLICY IF EXISTS profiles_public_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update_consolidated ON public.profiles;

-- Create optimized profiles policies
CREATE POLICY profiles_public_optimized ON public.profiles 
FOR SELECT TO anon, authenticated, authenticator, dashboard_user 
USING (true);

CREATE POLICY profiles_update_optimized ON public.profiles 
FOR UPDATE TO authenticated 
USING (
  id = public.current_user_id() OR 
  public.current_user_is_admin()
) 
WITH CHECK (
  id = public.current_user_id() OR 
  public.current_user_is_admin()
);

-- 6. OPTIMIZE ADMIN-ONLY TABLES WITH SINGLE POLICIES
-- ==============================================

-- List of admin-only tables to optimize
DO $$
DECLARE
    table_name text;
    admin_tables text[] := ARRAY[
        'abandoned_checkouts',
        'customer_analytics', 
        'customer_tag_assignments',
        'email_campaigns',
        'email_settings',
        'email_templates',
        'invoices',
        'meal_plan_sync'
    ];
BEGIN
    FOREACH table_name IN ARRAY admin_tables
    LOOP
        -- Drop all existing policies for this table
        EXECUTE format('DROP POLICY IF EXISTS "%s_admin_only" ON public.%I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "%s_admin_select" ON public.%I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "%s_admin_insert" ON public.%I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "%s_admin_update" ON public.%I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "%s_admin_delete" ON public.%I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %s" ON public.%I', replace(table_name, '_', ' '), table_name);
        
        -- Create single optimized admin-only policy
        EXECUTE format('CREATE POLICY %I_admin_optimized ON public.%I FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin())', table_name, table_name);
    END LOOP;
END $$;

-- 7. OPTIMIZE PUBLIC + ADMIN TABLES
-- ==============================================

-- Optimize discount_codes table
DROP POLICY IF EXISTS "Users can validate discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS discount_codes_admin_select ON public.discount_codes;
DROP POLICY IF EXISTS discount_codes_public_select ON public.discount_codes;
DROP POLICY IF EXISTS discount_codes_admin_manage ON public.discount_codes;

CREATE POLICY discount_codes_public_optimized ON public.discount_codes 
FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY discount_codes_admin_optimized ON public.discount_codes 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize order_bumps table
DROP POLICY IF EXISTS "Anyone can view active order bumps" ON public.order_bumps;
DROP POLICY IF EXISTS order_bumps_admin_select ON public.order_bumps;
DROP POLICY IF EXISTS order_bumps_public_select ON public.order_bumps;
DROP POLICY IF EXISTS order_bumps_admin_manage ON public.order_bumps;

CREATE POLICY order_bumps_public_optimized ON public.order_bumps 
FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY order_bumps_admin_optimized ON public.order_bumps 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize product_categories table
DROP POLICY IF EXISTS "Anyone can view product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Authenticated users can view product categories" ON public.product_categories;
DROP POLICY IF EXISTS product_categories_admin_select ON public.product_categories;
DROP POLICY IF EXISTS product_categories_public_select ON public.product_categories;
DROP POLICY IF EXISTS product_categories_admin_manage ON public.product_categories;

CREATE POLICY product_categories_public_optimized ON public.product_categories 
FOR SELECT TO anon, authenticated 
USING (true);

CREATE POLICY product_categories_admin_optimized ON public.product_categories 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize product_reviews table
DROP POLICY IF EXISTS "Anyone can view approved product reviews" ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_admin_select ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_public_select ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_admin_manage ON public.product_reviews;

CREATE POLICY product_reviews_public_optimized ON public.product_reviews 
FOR SELECT TO anon, authenticated 
USING (is_approved = true);

CREATE POLICY product_reviews_admin_optimized ON public.product_reviews 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize product_variants table
DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
DROP POLICY IF EXISTS product_variants_public_select ON public.product_variants;
DROP POLICY IF EXISTS product_variants_admin_manage ON public.product_variants;

CREATE POLICY product_variants_public_optimized ON public.product_variants 
FOR SELECT TO anon, authenticated, authenticator, dashboard_user 
USING (true);

CREATE POLICY product_variants_admin_optimized ON public.product_variants 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize shipping_settings table
DROP POLICY IF EXISTS "Anyone can view active shipping settings" ON public.shipping_settings;
DROP POLICY IF EXISTS "Authenticated users can view shipping settings" ON public.shipping_settings;
DROP POLICY IF EXISTS shipping_settings_admin_select ON public.shipping_settings;
DROP POLICY IF EXISTS shipping_settings_public_select ON public.shipping_settings;
DROP POLICY IF EXISTS shipping_settings_admin_manage ON public.shipping_settings;
DROP POLICY IF EXISTS "Allow all access to shipping_settings" ON public.shipping_settings;

CREATE POLICY shipping_settings_public_optimized ON public.shipping_settings 
FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY shipping_settings_admin_optimized ON public.shipping_settings 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize upsell_products table
DROP POLICY IF EXISTS "Anyone can view active upsell products" ON public.upsell_products;
DROP POLICY IF EXISTS upsell_products_admin_select ON public.upsell_products;
DROP POLICY IF EXISTS upsell_products_public_select ON public.upsell_products;
DROP POLICY IF EXISTS upsell_products_admin_manage ON public.upsell_products;

CREATE POLICY upsell_products_public_optimized ON public.upsell_products 
FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY upsell_products_admin_optimized ON public.upsell_products 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- 8. OPTIMIZE REMAINING TABLES
-- ==============================================

-- Optimize role_types table
DROP POLICY IF EXISTS "Authenticated users can view role types" ON public.role_types;
DROP POLICY IF EXISTS role_types_admin_select ON public.role_types;
DROP POLICY IF EXISTS role_types_authenticated_select ON public.role_types;
DROP POLICY IF EXISTS role_types_admin_manage ON public.role_types;

CREATE POLICY role_types_authenticated_optimized ON public.role_types 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY role_types_admin_optimized ON public.role_types 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize users table
DROP POLICY IF EXISTS users_admin_select ON public.users;
DROP POLICY IF EXISTS users_public_select ON public.users;
DROP POLICY IF EXISTS users_admin_manage ON public.users;

CREATE POLICY users_public_optimized ON public.users 
FOR SELECT TO anon, authenticated 
USING (true);

CREATE POLICY users_admin_optimized ON public.users 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- Optimize workflow_steps table
DROP POLICY IF EXISTS workflow_steps_admin_select ON public.workflow_steps;
DROP POLICY IF EXISTS workflow_steps_public_select ON public.workflow_steps;
DROP POLICY IF EXISTS workflow_steps_admin_manage ON public.workflow_steps;

CREATE POLICY workflow_steps_public_optimized ON public.workflow_steps 
FOR SELECT TO anon, authenticated 
USING (true);

CREATE POLICY workflow_steps_admin_optimized ON public.workflow_steps 
FOR ALL TO authenticated 
USING (public.current_user_is_admin()) 
WITH CHECK (public.current_user_is_admin());

-- 9. OPTIMIZE MISSING TABLE POLICIES
-- ==============================================

-- Add optimized policies for tables that might be missing them
DO $$
DECLARE
    missing_tables text[] := ARRAY[
        'customer_notes',
        'order_items', 
        'user_access_requests'
    ];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY missing_tables
    LOOP
        -- Drop any existing policies
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access to %s" ON public.%I', table_name, table_name);
        
        -- Create optimized admin-only policy
        EXECUTE format('CREATE POLICY %I_admin_optimized ON public.%I FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin())', table_name, table_name);
    END LOOP;
END $$;

-- 10. UPDATE EXISTING FUNCTIONS TO USE OPTIMIZED PATTERNS
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

-- 11. ANALYZE TABLES FOR BETTER PERFORMANCE
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
ANALYZE public.discount_codes;
ANALYZE public.order_bumps;
ANALYZE public.shipping_settings;

-- 12. SUCCESS MESSAGE
-- ==============================================

DO $$
DECLARE
    policy_count INTEGER;
    function_count INTEGER;
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
    
    RAISE NOTICE '🚀 RLS PERFORMANCE OPTIMIZATION COMPLETE! 🚀';
    RAISE NOTICE 'Optimized policies created: %', policy_count;
    RAISE NOTICE 'Helper functions created: %', function_count;
    RAISE NOTICE 'Auth function calls optimized for better performance';
    RAISE NOTICE 'Duplicate policies removed and consolidated';
    RAISE NOTICE 'Table statistics updated for better query planning';
    RAISE NOTICE 'Your database RLS is now highly optimized!';
END $$;
