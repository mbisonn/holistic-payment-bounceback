-- Comprehensive fix for all access issues
-- This script removes restrictive RLS policies and allows all verified users access to everything

-- First, let's check if customer_phone column exists and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_phone text;
    END IF;
END $$;

-- Drop all existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin access to products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admin access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admin access to order_bumps" ON public.order_bumps;
DROP POLICY IF EXISTS "Admin access to upsell_products" ON public.upsell_products;
DROP POLICY IF EXISTS "Admin access to discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admin access to customer_analytics" ON public.customer_analytics;
DROP POLICY IF EXISTS "Admin access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admin access to email_campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admin access to automation_workflows" ON public.automation_workflows;
DROP POLICY IF EXISTS "Admin access to automation_triggers" ON public.automation_triggers;
DROP POLICY IF EXISTS "Admin access to automation_actions" ON public.automation_actions;
DROP POLICY IF EXISTS "Admin access to automation_logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Admin access to tags" ON public.tags;
DROP POLICY IF EXISTS "Admin access to customer_tags" ON public.customer_tags;
DROP POLICY IF EXISTS "Admin access to shipping_settings" ON public.shipping_settings;
DROP POLICY IF EXISTS "Admin access to meal_plan_sync" ON public.meal_plan_sync;
DROP POLICY IF EXISTS "Admin access to user_access_requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admin access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin access to scheduled_emails" ON public.scheduled_emails;
DROP POLICY IF EXISTS "Admin access to email_tracking" ON public.email_tracking;

-- Create permissive policies for all authenticated users
-- Profiles table
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Products table
CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Orders table
CREATE POLICY "Authenticated users can manage orders" ON public.orders
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Order bumps table
CREATE POLICY "Authenticated users can manage order_bumps" ON public.order_bumps
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Upsell products table
CREATE POLICY "Authenticated users can manage upsell_products" ON public.upsell_products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Discount codes table
CREATE POLICY "Authenticated users can manage discount_codes" ON public.discount_codes
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer analytics table
CREATE POLICY "Authenticated users can manage customer_analytics" ON public.customer_analytics
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Email templates table
CREATE POLICY "Authenticated users can manage email_templates" ON public.email_templates
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Email campaigns table
CREATE POLICY "Authenticated users can manage email_campaigns" ON public.email_campaigns
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Automation workflows table
CREATE POLICY "Authenticated users can manage automation_workflows" ON public.automation_workflows
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Automation triggers table
CREATE POLICY "Authenticated users can manage automation_triggers" ON public.automation_triggers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Automation actions table
CREATE POLICY "Authenticated users can manage automation_actions" ON public.automation_actions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Automation logs table
CREATE POLICY "Authenticated users can manage automation_logs" ON public.automation_logs
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Tags table
CREATE POLICY "Authenticated users can manage tags" ON public.tags
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer tags table
CREATE POLICY "Authenticated users can manage customer_tags" ON public.customer_tags
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Shipping settings table
CREATE POLICY "Authenticated users can manage shipping_settings" ON public.shipping_settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Meal plan sync table
CREATE POLICY "Authenticated users can manage meal_plan_sync" ON public.meal_plan_sync
    FOR ALL USING (auth.uid() IS NOT NULL);

-- User access requests table
CREATE POLICY "Authenticated users can manage user_access_requests" ON public.user_access_requests
    FOR ALL USING (auth.uid() IS NOT NULL);

-- User roles table
CREATE POLICY "Authenticated users can manage user_roles" ON public.user_roles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Scheduled emails table
CREATE POLICY "Authenticated users can manage scheduled_emails" ON public.scheduled_emails
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Email tracking table
CREATE POLICY "Authenticated users can manage email_tracking" ON public.email_tracking
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Ensure all tables have RLS enabled but with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create or update helper functions for role checking
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, return true for all authenticated users
  -- This effectively gives everyone access to everything
  RETURN user_id IS NOT NULL;
END;
$$;

-- Create or update function to get all users (for user center)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
  FROM public.profiles p;
END;
$$;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All access restrictions have been removed. All authenticated users now have full access to all data.';
END $$;
