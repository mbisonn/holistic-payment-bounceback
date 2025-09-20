-- Minimal Core Setup Migration
-- Date: 2024-01-01 00:00:00
-- Description: Establishes minimal core tables and types needed for the application

-- STEP 1: Create core types
-- ==============================================
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'verified', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- STEP 2: Create core tables
-- ==============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    category text,
    stock_quantity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    total_amount numeric NOT NULL,
    status text DEFAULT 'pending',
    payment_status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL,
    price numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- STEP 3: Create core functions
-- ==============================================

-- Create has_role function (overloaded versions)
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

-- Create overloaded version for app_role type
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, role_name app_role)
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
      AND ur.role = role_name
  );
$$;

-- Create current_user_is_admin function
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

-- STEP 4: Enable RLS on all tables
-- ==============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create basic RLS policies
-- ==============================================

-- Profiles: public read, own update
CREATE POLICY profiles_public_read ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_own_update ON public.profiles FOR UPDATE USING (id = auth.uid());

-- User roles: users can read own roles, admins can manage all
CREATE POLICY user_roles_read_own ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_roles_admin_manage ON public.user_roles FOR ALL USING (public.current_user_is_admin());

-- Products: public read for active products, admin manage all
CREATE POLICY products_public_read ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY products_admin_manage ON public.products FOR ALL USING (public.current_user_is_admin());

-- Orders: users can read own orders, admins can manage all
CREATE POLICY orders_user_read_own ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.current_user_is_admin());
CREATE POLICY orders_admin_manage ON public.orders FOR ALL USING (public.current_user_is_admin());

-- Order items: users can read own order items, admins can manage all
CREATE POLICY order_items_user_read_own ON public.order_items FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR 
    public.current_user_is_admin()
);
CREATE POLICY order_items_admin_manage ON public.order_items FOR ALL USING (public.current_user_is_admin());

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- STEP 6: Grant permissions
-- ==============================================
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, anon;

-- STEP 7: Insert admin user
-- ==============================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- STEP 8: Success message
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🚀 MINIMAL CORE SETUP COMPLETE! 🚀';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ CREATED:';
    RAISE NOTICE '- Core tables: profiles, user_roles, products, orders, order_items';
    RAISE NOTICE '- Core functions: has_role, current_user_is_admin';
    RAISE NOTICE '- Basic RLS policies for all tables';
    RAISE NOTICE '- Admin role for ebuchenna1@gmail.com';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Ready for additional migrations!';
    RAISE NOTICE '=====================================';
END $$;
