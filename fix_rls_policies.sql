-- Fix RLS and Authentication Issues
-- This script consolidates all RLS policies and fixes authentication problems

-- 1. Create unified admin checking function
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::app_role
  );
$$;

-- 2. Create unified verified user checking function
CREATE OR REPLACE FUNCTION public.current_user_is_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('verified'::app_role, 'admin'::app_role)
  );
$$;

-- 3. Create unified role checking function
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id
      AND ur.role = role_name::app_role
  );
$$;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, anon;

-- 5. Drop all existing conflicting policies
DO $$
DECLARE
    r RECORD;
    pol RECORD;
BEGIN
    -- Get all tables in public schema
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'pg_stat_statements')
    LOOP
        -- Drop all existing policies
        FOR pol IN
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = r.schemaname 
            AND tablename = r.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                pol.policyname, r.schemaname, r.tablename);
        END LOOP;
    END LOOP;
END $$;

-- 6. Create unified RLS policies for all tables
DO $$
DECLARE
    r RECORD;
    table_name text;
    tables text[] := ARRAY[
        'profiles', 'user_roles', 'products', 'orders', 'order_items',
        'email_settings', 'email_templates', 'email_campaigns', 'email_logs',
        'discount_codes', 'upsell_products', 'order_bumps', 'customer_tags',
        'customer_tag_assignments', 'invoices', 'shipping_settings',
        'shipping_zones', 'store_settings', 'analytics_metrics',
        'automations', 'automation_rules', 'scheduled_emails',
        'abandoned_checkouts', 'product_reviews', 'settings',
        'achievements', 'client_onboarding', 'upsell_transactions',
        'product_analytics', 'customer_analytics', 'email_analytics',
        'workflow_steps', 'customer_exports', 'meal_plan_sync'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            
            -- Create SELECT policy: admins and verified users can read
            EXECUTE format('
                CREATE POLICY %I ON public.%I FOR SELECT TO authenticated 
                USING (public.current_user_is_admin() OR public.current_user_is_verified())
            ', table_name || '_select_policy', table_name);
            
            -- Create INSERT/UPDATE/DELETE policy: admins only
            EXECUTE format('
                CREATE POLICY %I ON public.%I FOR ALL TO authenticated 
                USING (public.current_user_is_admin())
                WITH CHECK (public.current_user_is_admin())
            ', table_name || '_admin_policy', table_name);
        END IF;
    END LOOP;
END $$;

-- 7. Special policies for specific tables

-- User roles: admins can manage, users can view their own
DROP POLICY IF EXISTS user_roles_select_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_policy ON public.user_roles;

CREATE POLICY user_roles_select_policy ON public.user_roles FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY user_roles_admin_policy ON public.user_roles FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Orders: users can view their own orders, admins can view all
DROP POLICY IF EXISTS orders_select_policy ON public.orders;
DROP POLICY IF EXISTS orders_admin_policy ON public.orders;

CREATE POLICY orders_select_policy ON public.orders FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY orders_admin_policy ON public.orders FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Order items: users can view their own order items, admins can view all
DROP POLICY IF EXISTS order_items_select_policy ON public.order_items;
DROP POLICY IF EXISTS order_items_admin_policy ON public.order_items;

CREATE POLICY order_items_select_policy ON public.order_items FOR SELECT TO authenticated 
USING (
    order_id IN (
        SELECT id FROM public.orders 
        WHERE user_id = auth.uid()
    ) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY order_items_admin_policy ON public.order_items FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Products: public read access for active products, admin management
DROP POLICY IF EXISTS products_select_policy ON public.products;
DROP POLICY IF EXISTS products_admin_policy ON public.products;

CREATE POLICY products_public_select ON public.products FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY products_verified_select ON public.products FOR SELECT TO authenticated 
USING (public.current_user_is_admin() OR public.current_user_is_verified());

CREATE POLICY products_admin_policy ON public.products FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Profiles: users can view all profiles, update their own
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_policy ON public.profiles;

CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT TO authenticated 
USING (true);

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY profiles_admin_policy ON public.profiles FOR INSERT, DELETE TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- 9. Ensure all admin users have proper roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
    'ebuchenna1@gmail.com',
    'info@bouncebacktolifeconsult.pro',
    'bouncebacktolifeconsult@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
