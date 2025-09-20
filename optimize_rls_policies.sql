-- Optimize RLS policies to fix performance warnings
-- Run this script in Supabase SQL Editor

-- 1. Drop all existing policies that are causing conflicts
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_access" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view own requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.user_access_requests;

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "products_access" ON public.products;
DROP POLICY IF EXISTS "products_public_access" ON public.products;

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "orders_access" ON public.orders;

-- 2. Create optimized RLS policies for user_roles (all authenticated users have access)
CREATE POLICY "user_roles_select_policy" ON public.user_roles
    FOR SELECT USING (
        (SELECT auth.uid()) IS NOT NULL
    );

CREATE POLICY "user_roles_insert_policy" ON public.user_roles
    FOR INSERT WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
    );

CREATE POLICY "user_roles_update_policy" ON public.user_roles
    FOR UPDATE USING (
        (SELECT auth.uid()) IS NOT NULL
    );

CREATE POLICY "user_roles_delete_policy" ON public.user_roles
    FOR DELETE USING (
        (SELECT auth.uid()) IS NOT NULL
    );

-- 3. Create optimized RLS policies for user_access_requests (all authenticated users have access)
CREATE POLICY "user_access_requests_select_policy" ON public.user_access_requests
    FOR SELECT USING (
        (SELECT auth.uid()) IS NOT NULL
    );

CREATE POLICY "user_access_requests_insert_policy" ON public.user_access_requests
    FOR INSERT WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
    );

CREATE POLICY "user_access_requests_update_policy" ON public.user_access_requests
    FOR UPDATE USING (
        (SELECT auth.uid()) IS NOT NULL
    );

-- 4. Create optimized RLS policies for products (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        CREATE POLICY "products_select_policy" ON public.products
            FOR SELECT USING (
                true -- Allow public read access
            );

        CREATE POLICY "products_modify_policy" ON public.products
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL -- All authenticated users can modify
            );
    END IF;
END $$;

-- 5. Create optimized RLS policies for orders (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        CREATE POLICY "orders_select_policy" ON public.orders
            FOR SELECT USING (
                (SELECT auth.uid()) IS NOT NULL -- All authenticated users can view orders
            );

        CREATE POLICY "orders_modify_policy" ON public.orders
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL -- All authenticated users can modify orders
            );
    END IF;
END $$;

-- 6. Create optimized policies for other common tables
DO $$
BEGIN
    -- Email campaigns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "email_campaigns_access" ON public.email_campaigns;
        CREATE POLICY "email_campaigns_admin_policy" ON public.email_campaigns
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL
            );
    END IF;

    -- Email templates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "email_templates_access" ON public.email_templates;
        CREATE POLICY "email_templates_admin_policy" ON public.email_templates
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL
            );
    END IF;

    -- Customers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "customers_access" ON public.customers;
        CREATE POLICY "customers_admin_policy" ON public.customers
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL
            );
    END IF;

    -- Discount codes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "discount_codes_access" ON public.discount_codes;
        CREATE POLICY "discount_codes_admin_policy" ON public.discount_codes
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL
            );
    END IF;

    -- Invoices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "invoices_access" ON public.invoices;
        CREATE POLICY "invoices_admin_policy" ON public.invoices
            FOR ALL USING (
                (SELECT auth.uid()) IS NOT NULL
            );
    END IF;
END $$;

-- 7. Verification query
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'user_access_requests', 'products', 'orders')
ORDER BY tablename, policyname;
