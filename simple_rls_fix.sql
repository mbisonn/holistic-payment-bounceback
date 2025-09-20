-- Simple RLS fix - works with existing table structure
-- Run this in Supabase Dashboard SQL Editor

-- 1. Create app_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'verified', 'admin', 'moderator', 'manager');
    END IF;
END$$;

-- 2. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create admin checking function
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

-- 5. Create verified user checking function
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

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO authenticated, anon;

-- 7. Create basic policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 8. Fix products table policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "products_public_select" ON public.products;
DROP POLICY IF EXISTS "products_verified_select" ON public.products;
DROP POLICY IF EXISTS "products_admin_policy" ON public.products;

CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY "Verified users can view all products" ON public.products FOR SELECT TO authenticated 
USING (public.current_user_is_admin() OR public.current_user_is_verified());

CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 9. Fix orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_policy" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 10. Fix profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- 12. Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

-- 13. Ensure all admin users have proper roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
    'ebuchenna1@gmail.com',
    'info@bouncebacktolifeconsult.pro',
    'bouncebacktolifeconsult@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
