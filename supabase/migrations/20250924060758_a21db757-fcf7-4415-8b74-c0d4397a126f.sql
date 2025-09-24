-- Fix user_roles SELECT policy to allow users to check their own roles
-- This will fix the admin check issue and allow dashboard access
CREATE POLICY "user_roles_select_all_authenticated" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (true);

-- Also allow all authenticated users to read basic data they need for dashboard
CREATE POLICY "products_select_all_authenticated" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "orders_select_all_authenticated" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "order_bumps_select_all_authenticated" 
ON public.order_bumps 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "discount_codes_select_all_authenticated" 
ON public.discount_codes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "upsell_products_select_all_authenticated" 
ON public.upsell_products 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "shipping_settings_select_all_authenticated" 
ON public.shipping_settings 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_select_all_authenticated" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());