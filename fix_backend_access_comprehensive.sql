-- Comprehensive Backend Access Fix
-- This fixes all RLS policies to ensure authenticated users can see all data

-- Fix upsell products visibility
DROP POLICY IF EXISTS "Users can view upsell products" ON public.upsell_products;
CREATE POLICY "Users can view upsell products" ON public.upsell_products
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix order bumps visibility
DROP POLICY IF EXISTS "Users can view order bumps" ON public.order_bumps;
CREATE POLICY "Users can view order bumps" ON public.order_bumps
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix automation content visibility
DROP POLICY IF EXISTS "Users can view automation content" ON public.automation_content;
CREATE POLICY "Users can view automation content" ON public.automation_content
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix email templates visibility
DROP POLICY IF EXISTS "Users can view email templates" ON public.email_templates;
CREATE POLICY "Users can view email templates" ON public.email_templates
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix email campaigns visibility
DROP POLICY IF EXISTS "Users can view email campaigns" ON public.email_campaigns;
CREATE POLICY "Users can view email campaigns" ON public.email_campaigns
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix tags visibility
DROP POLICY IF EXISTS "Users can view tags" ON public.tags;
CREATE POLICY "Users can view tags" ON public.tags
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix discount codes visibility
DROP POLICY IF EXISTS "Users can view discount codes" ON public.discount_codes;
CREATE POLICY "Users can view discount codes" ON public.discount_codes
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix meal plan sync visibility
DROP POLICY IF EXISTS "Users can view meal plan sync" ON public.meal_plan_sync;
CREATE POLICY "Users can view meal plan sync" ON public.meal_plan_sync
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix customer tags visibility
DROP POLICY IF EXISTS "Users can view customer tags" ON public.customer_tags;
CREATE POLICY "Users can view customer tags" ON public.customer_tags
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix products visibility
DROP POLICY IF EXISTS "Users can view products" ON public.products;
CREATE POLICY "Users can view products" ON public.products
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix orders visibility
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
CREATE POLICY "Users can view orders" ON public.orders
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix profiles visibility
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix user access requests visibility
DROP POLICY IF EXISTS "Users can view access requests" ON public.user_access_requests;
CREATE POLICY "Users can view access requests" ON public.user_access_requests
FOR ALL USING (auth.uid() IS NOT NULL);

-- Ensure all tables have proper permissions
GRANT ALL ON public.upsell_products TO authenticated;
GRANT ALL ON public.order_bumps TO authenticated;
GRANT ALL ON public.automation_content TO authenticated;
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_campaigns TO authenticated;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.discount_codes TO authenticated;
GRANT ALL ON public.meal_plan_sync TO authenticated;
GRANT ALL ON public.customer_tags TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_access_requests TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify policies are working
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
AND tablename IN ('upsell_products', 'order_bumps', 'automation_content', 'email_templates')
ORDER BY tablename, policyname;
