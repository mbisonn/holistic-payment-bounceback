-- Complete fix for all access issues
-- This script addresses logout, user visibility, and dashboard data access

-- 1. First, ensure the get_all_users function works for all authenticated users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    user_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Allow ALL authenticated users to view all users (no admin check)
    -- Return all users from auth.users
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.email_confirmed_at,
        au.user_metadata
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$;

-- 2. Drop all existing restrictive RLS policies
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

DROP POLICY IF EXISTS "user_access_requests_select_policy" ON public.user_access_requests;
DROP POLICY IF EXISTS "user_access_requests_insert_policy" ON public.user_access_requests;
DROP POLICY IF EXISTS "user_access_requests_update_policy" ON public.user_access_requests;

-- Drop product and order policies (only if tables exist)
DO $$
BEGIN
    -- Products
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "products_select_policy" ON public.products;
        DROP POLICY IF EXISTS "products_modify_policy" ON public.products;
        DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
        DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
        DROP POLICY IF EXISTS "products_access" ON public.products;
        DROP POLICY IF EXISTS "products_public_access" ON public.products;
    END IF;
    
    -- Orders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
        DROP POLICY IF EXISTS "orders_modify_policy" ON public.orders;
        DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
        DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
        DROP POLICY IF EXISTS "orders_access" ON public.orders;
    END IF;
END $$;

-- Drop other table policies (only if tables exist)
DO $$
BEGIN
    -- Email campaigns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "email_campaigns_admin_policy" ON public.email_campaigns;
        DROP POLICY IF EXISTS "email_campaigns_access" ON public.email_campaigns;
    END IF;
    
    -- Email templates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "email_templates_admin_policy" ON public.email_templates;
        DROP POLICY IF EXISTS "email_templates_access" ON public.email_templates;
    END IF;
    
    -- Customers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "customers_admin_policy" ON public.customers;
        DROP POLICY IF EXISTS "customers_access" ON public.customers;
    END IF;
    
    -- Discount codes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "discount_codes_admin_policy" ON public.discount_codes;
        DROP POLICY IF EXISTS "discount_codes_access" ON public.discount_codes;
    END IF;
    
    -- Invoices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "invoices_admin_policy" ON public.invoices;
        DROP POLICY IF EXISTS "invoices_access" ON public.invoices;
    END IF;
END $$;

-- 3. Create simple "allow all authenticated users" policies for all tables

-- User roles - full access for all authenticated users
CREATE POLICY "user_roles_full_access" ON public.user_roles
    FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- User access requests - full access for all authenticated users  
CREATE POLICY "user_access_requests_full_access" ON public.user_access_requests
    FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Products - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        CREATE POLICY "products_full_access" ON public.products
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Orders - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        CREATE POLICY "orders_full_access" ON public.orders
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Email campaigns - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
        CREATE POLICY "email_campaigns_full_access" ON public.email_campaigns
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Email templates - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        CREATE POLICY "email_templates_full_access" ON public.email_templates
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Customers - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        CREATE POLICY "customers_full_access" ON public.customers
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Discount codes - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes' AND table_schema = 'public') THEN
        CREATE POLICY "discount_codes_full_access" ON public.discount_codes
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Invoices - full access for all authenticated users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        CREATE POLICY "invoices_full_access" ON public.invoices
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- 4. Ensure RLS is enabled on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
        ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes' AND table_schema = 'public') THEN
        ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Grant necessary permissions (only if functions exist)
DO $$
BEGIN
    -- Grant permissions only if functions exist
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_all_users' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.get_all_users TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_access_request' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.create_access_request TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'approve_access_request' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.approve_access_request TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'reject_access_request' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.reject_access_request TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'has_role' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
    END IF;
END $$;

-- 6. Verification query to check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
