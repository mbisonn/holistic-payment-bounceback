-- Complete database setup - creates all necessary tables and RLS policies
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

-- 8. Create admin checking function
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

-- 9. Create verified user checking function
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

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO authenticated, anon;

-- 11. Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 12. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

-- 13. Create RLS policies for products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Verified users can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated 
USING (is_active = true);

CREATE POLICY "Verified users can view all products" ON public.products FOR SELECT TO authenticated 
USING (public.current_user_is_admin() OR public.current_user_is_verified());

CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 14. Create RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 15. Create RLS policies for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT TO authenticated 
USING (
    order_id IN (
        SELECT id FROM public.orders 
        WHERE user_id = auth.uid()
    ) OR 
    public.current_user_is_admin() OR 
    public.current_user_is_verified()
);

CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL TO authenticated 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 16. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- 17. Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;

-- 18. Ensure all admin users have proper roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
    'ebuchenna1@gmail.com',
    'info@bouncebacktolifeconsult.pro',
    'bouncebacktolifeconsult@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 19. Create a trigger to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
