-- Optimized RLS fix - addresses all linter warnings
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

-- 3. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    role text DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email text NOT NULL,
    customer_name text,
    total_amount decimal(10,2) NOT NULL,
    status text DEFAULT 'pending',
    payment_status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    price decimal(10,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 7. Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 8. Create optimized admin checking function
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
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  );
$$;

-- 9. Create optimized verified user checking function
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
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('verified'::app_role, 'admin'::app_role)
  );
$$;

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO authenticated, anon;

-- 11. Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Verified users can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

-- 12. Create optimized single policies (no multiple permissive policies)

-- User roles: single policy for all operations
CREATE POLICY "user_roles_access" ON public.user_roles FOR ALL TO authenticated 
USING (
    user_id = (SELECT auth.uid()) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
)
WITH CHECK (public.current_user_is_admin());

-- Profiles: single policy for all operations
CREATE POLICY "profiles_access" ON public.profiles FOR ALL TO authenticated 
USING (
    id = (SELECT auth.uid()) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
)
WITH CHECK (
    id = (SELECT auth.uid()) OR 
    public.current_user_is_admin()
);

-- Products: single policy for all operations
CREATE POLICY "products_access" ON public.products FOR ALL TO authenticated 
USING (
    is_active = true OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
)
WITH CHECK (public.current_user_is_admin());

-- Public access for active products (anon users)
CREATE POLICY "products_public_access" ON public.products FOR SELECT TO anon 
USING (is_active = true);

-- Orders: single policy for all operations
CREATE POLICY "orders_access" ON public.orders FOR ALL TO authenticated 
USING (
    user_id = (SELECT auth.uid()) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
)
WITH CHECK (public.current_user_is_admin());

-- Order items: single policy for all operations
CREATE POLICY "order_items_access" ON public.order_items FOR ALL TO authenticated 
USING (
    order_id IN (
        SELECT id FROM public.orders 
        WHERE user_id = (SELECT auth.uid())
    ) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
)
WITH CHECK (public.current_user_is_admin());

-- 13. Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- 14. Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;

-- 15. Create optimized trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add user to profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 16. Ensure all admin users have proper roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
    'ebuchenna1@gmail.com',
    'info@bouncebacktolifeconsult.pro',
    'bouncebacktolifeconsult@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 17. Fix customer_notes table if it exists (enable RLS)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_notes') THEN
        ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for customer_notes
        DROP POLICY IF EXISTS "customer_notes_access" ON public.customer_notes;
        CREATE POLICY "customer_notes_access" ON public.customer_notes FOR ALL TO authenticated 
        USING (public.current_user_is_admin() OR public.current_user_is_verified())
        WITH CHECK (public.current_user_is_admin());
    END IF;
END $$;
