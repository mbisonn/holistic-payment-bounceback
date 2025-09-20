-- Migration: Fix Policy Conflicts and Auth Wrapping
-- Date: 2025-09-18 05:20:00
-- Description: Fix auth_rls_initplan warnings and multiple_permissive_policies conflicts

-- STEP 1: DROP ALL CONFLICTING POLICIES
-- ==============================================

-- Drop all existing policies on user_roles, profiles, and products to start clean
DROP POLICY IF EXISTS "user_roles_read_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_consolidated_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_consolidated_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_consolidated_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_consolidated_delete" ON public.user_roles;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_consolidated_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_consolidated_update" ON public.profiles;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_manage" ON public.products;
DROP POLICY IF EXISTS "products_consolidated_select" ON public.products;
DROP POLICY IF EXISTS "products_consolidated_insert" ON public.products;
DROP POLICY IF EXISTS "products_consolidated_update" ON public.products;
DROP POLICY IF EXISTS "products_consolidated_delete" ON public.products;

-- STEP 2: CREATE SINGLE OPTIMIZED POLICIES WITH PROPER AUTH WRAPPING
-- ==============================================

-- Drop any existing final policies first
DROP POLICY IF EXISTS "user_roles_select_final" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_final" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_final" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_final" ON public.user_roles;
DROP POLICY IF EXISTS "profiles_select_final" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_final" ON public.profiles;
DROP POLICY IF EXISTS "products_select_final" ON public.products;
DROP POLICY IF EXISTS "products_insert_final" ON public.products;
DROP POLICY IF EXISTS "products_update_final" ON public.products;
DROP POLICY IF EXISTS "products_delete_final" ON public.products;

-- USER_ROLES: Single policy for each action with proper auth wrapping
CREATE POLICY "user_roles_select_final" ON public.user_roles
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "user_roles_insert_final" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin'::app_role)));

CREATE POLICY "user_roles_update_final" ON public.user_roles
FOR UPDATE TO authenticated
USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin'::app_role)))
WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin'::app_role)));

CREATE POLICY "user_roles_delete_final" ON public.user_roles
FOR DELETE TO authenticated
USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin'::app_role)));

-- PROFILES: Single policy for each action with proper auth wrapping
CREATE POLICY "profiles_select_final" ON public.profiles
FOR SELECT TO anon, authenticated, authenticator, dashboard_user
USING (true);

CREATE POLICY "profiles_update_final" ON public.profiles
FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)))
WITH CHECK (id = (SELECT auth.uid()) OR (SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)));

-- PRODUCTS: Single policy for each action with proper auth wrapping
CREATE POLICY "products_select_final" ON public.products
FOR SELECT TO anon, authenticated, authenticator, dashboard_user
USING (true);

CREATE POLICY "products_insert_final" ON public.products
FOR INSERT TO authenticated
WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)));

CREATE POLICY "products_update_final" ON public.products
FOR UPDATE TO authenticated
USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)))
WITH CHECK ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)));

CREATE POLICY "products_delete_final" ON public.products
FOR DELETE TO authenticated
USING ((SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::app_role)));

-- STEP 3: SUCCESS MESSAGE
-- ==============================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('user_roles', 'profiles', 'products')
    AND policyname LIKE '%_final';
    
    RAISE NOTICE '';
    RAISE NOTICE '🚀 POLICY CONFLICTS AND AUTH WRAPPING FIXED! 🚀';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Final optimized policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ FIXES APPLIED:';
    RAISE NOTICE '- auth_rls_initplan: All auth.uid() calls wrapped in SELECT statements';
    RAISE NOTICE '- multiple_permissive_policies: All duplicate policies removed';
    RAISE NOTICE '- Single optimized policy per table/action combination';
    RAISE NOTICE '- Users can read their own roles for login functionality';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 All linter warnings should now be resolved!';
    RAISE NOTICE '=====================================';
END $$;
