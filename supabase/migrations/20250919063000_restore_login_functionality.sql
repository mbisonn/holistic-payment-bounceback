-- Restore Login Functionality Migration
-- Date: 2025-09-19 06:30:00
-- Description: Critical fixes to restore login functionality by fixing overly restrictive RLS policies

-- STEP 1: Fix the missing semicolon from previous migration
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE 'Starting login functionality restoration...';
END $$;

-- STEP 2: Fix USER_ROLES table access (MOST CRITICAL)
-- ==============================================
-- This is essential for login functionality as users need to read their own roles

-- Drop any overly restrictive admin-only policies on user_roles
DROP POLICY IF EXISTS "user_roles_admin_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_read_own" ON public.user_roles;

-- Create a policy that allows users to read their own roles (essential for login flow)
CREATE POLICY "user_roles_read_own" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow admins to manage all user roles
CREATE POLICY "user_roles_admin_manage" ON public.user_roles
FOR ALL TO authenticated
USING (
    -- Allow if user is reading their own role OR if they're admin
    (user_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
)
WITH CHECK (
    -- Only admins can insert/update/delete
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role)
);

-- STEP 3: Fix PROFILES table access (needed for user info)
-- ==============================================

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;

-- Allow users to read all profiles (public info) and update their own
CREATE POLICY "profiles_public_read" ON public.profiles
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "profiles_own_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_manage" ON public.profiles
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role)
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role)
);

-- STEP 4: Fix PRODUCTS table access (needed for dashboard)
-- ==============================================

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "products_admin_select" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_manage" ON public.products;

-- Allow public read access to products (needed for frontend)
CREATE POLICY "products_public_read" ON public.products
FOR SELECT TO anon, authenticated
USING (true);

-- Admin-only for modifications
CREATE POLICY "products_admin_manage" ON public.products
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role)
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role)
);

-- STEP 5: Fix ORDERS table access (needed for dashboard)
-- ==============================================

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "orders_admin_select" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
DROP POLICY IF EXISTS "orders_user_read_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_manage" ON public.orders;

-- Allow users to read own orders, admins can manage all
CREATE POLICY "orders_user_read_own" ON public.orders
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "orders_admin_manage" ON public.orders
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- STEP 6: Ensure admin user exists and has proper role
-- ==============================================

-- Insert admin role for ebuchenna1@gmail.com if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- STEP 7: Success message
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🚀 LOGIN FUNCTIONALITY RESTORED! 🚀';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ CRITICAL FIXES APPLIED:';
    RAISE NOTICE '- user_roles: Users can now read their own roles (essential for login)';
    RAISE NOTICE '- profiles: Public read access restored';
    RAISE NOTICE '- products: Public read access restored';
    RAISE NOTICE '- orders: User and admin access restored';
    RAISE NOTICE '- Admin role ensured for ebuchenna1@gmail.com';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Login redirect should now work correctly!';
    RAISE NOTICE '🎉 Dashboard should show products and data!';
    RAISE NOTICE '🎉 Admin functionality restored!';
    RAISE NOTICE '=====================================';
END $$;
