-- Fix Backend Access for Existing Tables Only
-- This script checks if tables exist before creating policies

-- Fix upsell products visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'upsell_products' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view upsell products" ON public.upsell_products;
        CREATE POLICY "Users can view upsell products" ON public.upsell_products
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.upsell_products TO authenticated;
    END IF;
END $$;

-- Fix order bumps visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_bumps' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view order bumps" ON public.order_bumps;
        CREATE POLICY "Users can view order bumps" ON public.order_bumps
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.order_bumps TO authenticated;
    END IF;
END $$;

-- Fix email templates visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view email templates" ON public.email_templates;
        CREATE POLICY "Users can view email templates" ON public.email_templates
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.email_templates TO authenticated;
    END IF;
END $$;

-- Fix email campaigns visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view email campaigns" ON public.email_campaigns;
        CREATE POLICY "Users can view email campaigns" ON public.email_campaigns
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.email_campaigns TO authenticated;
    END IF;
END $$;

-- Fix tags visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view tags" ON public.tags;
        CREATE POLICY "Users can view tags" ON public.tags
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.tags TO authenticated;
    END IF;
END $$;

-- Fix discount codes visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view discount codes" ON public.discount_codes;
        CREATE POLICY "Users can view discount codes" ON public.discount_codes
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.discount_codes TO authenticated;
    END IF;
END $$;

-- Fix products visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view products" ON public.products;
        CREATE POLICY "Users can view products" ON public.products
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.products TO authenticated;
    END IF;
END $$;

-- Fix orders visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
        CREATE POLICY "Users can view orders" ON public.orders
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.orders TO authenticated;
    END IF;
END $$;

-- Fix profiles visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
        CREATE POLICY "Users can view profiles" ON public.profiles
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.profiles TO authenticated;
    END IF;
END $$;

-- Fix user access requests visibility (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_access_requests' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view access requests" ON public.user_access_requests;
        CREATE POLICY "Users can view access requests" ON public.user_access_requests
        FOR ALL USING (auth.uid() IS NOT NULL);
        GRANT ALL ON public.user_access_requests TO authenticated;
    END IF;
END $$;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Show which tables were processed
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN 'EXISTS - Policy Updated'
        ELSE 'MISSING - Skipped'
    END as status
FROM (
    VALUES 
        ('upsell_products'),
        ('order_bumps'),
        ('email_templates'),
        ('email_campaigns'),
        ('tags'),
        ('discount_codes'),
        ('products'),
        ('orders'),
        ('profiles'),
        ('user_access_requests')
) AS t(table_name)
ORDER BY table_name;
