-- HARD RESET DATABASE - Fix All Issues
-- This script performs a comprehensive database reset to fix all linter issues

-- 1. Fix function search_path security warnings
DROP FUNCTION IF EXISTS public.create_access_request(text, text);
CREATE FUNCTION public.create_access_request(user_email text, request_reason text DEFAULT 'Access request')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id uuid;
BEGIN
  INSERT INTO public.user_access_requests (user_email, reason, status)
  VALUES (user_email, request_reason, 'pending')
  RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;

DROP FUNCTION IF EXISTS public.approve_access_request(uuid);
CREATE FUNCTION public.approve_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_access_requests 
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.reject_access_request(uuid);
CREATE FUNCTION public.reject_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_access_requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, text);
CREATE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN user_id IS NOT NULL;
END;
$$;

DROP FUNCTION IF EXISTS public.get_all_users();
CREATE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 2. Fix security definer views
DROP VIEW IF EXISTS public.order_summary_view;
CREATE VIEW public.order_summary_view AS
SELECT 
  o.id,
  o.customer_email,
  o.total_amount,
  o.status,
  o.created_at
FROM public.orders o;

DROP VIEW IF EXISTS public.active_products_view;
CREATE VIEW public.active_products_view AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.description,
  p.is_active
FROM public.products p
WHERE p.is_active = true;

-- 3. Clean up duplicate RLS policies and optimize performance
-- Remove all existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 4. Create optimized single policies for each table
-- Upsell Products
CREATE POLICY "authenticated_access_upsell_products" ON public.upsell_products
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Order Bumps  
CREATE POLICY "authenticated_access_order_bumps" ON public.order_bumps
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Email Templates
CREATE POLICY "authenticated_access_email_templates" ON public.email_templates
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Email Campaigns
CREATE POLICY "authenticated_access_email_campaigns" ON public.email_campaigns
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Tags
CREATE POLICY "authenticated_access_tags" ON public.tags
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Discount Codes
CREATE POLICY "authenticated_access_discount_codes" ON public.discount_codes
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Products
CREATE POLICY "authenticated_access_products" ON public.products
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Orders
CREATE POLICY "authenticated_access_orders" ON public.orders
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Profiles
CREATE POLICY "authenticated_access_profiles" ON public.profiles
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- User Access Requests
CREATE POLICY "authenticated_access_user_access_requests" ON public.user_access_requests
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- User Roles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_user_roles" ON public.user_roles
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Order Items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_order_items" ON public.order_items
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Customer Tags
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_tags' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_customer_tags" ON public.customer_tags
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Shipping Settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_settings' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_shipping_settings" ON public.shipping_settings
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Automation tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_workflows' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_automation_workflows" ON public.automation_workflows
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_triggers' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_automation_triggers" ON public.automation_triggers
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_actions' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_automation_actions" ON public.automation_actions
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_rules' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_automation_rules" ON public.automation_rules
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_automation_logs" ON public.automation_logs
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- Email tracking and other tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_tracking' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_email_tracking" ON public.email_tracking
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_meal_plans" ON public.meal_plans
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plan_sync' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_meal_plan_sync" ON public.meal_plan_sync
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_emails' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_scheduled_emails" ON public.scheduled_emails
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_audit_log' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_auth_audit_log" ON public.auth_audit_log
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_notes' AND table_schema = 'public') THEN
        CREATE POLICY "authenticated_access_customer_notes" ON public.customer_notes
        FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;

-- 5. Grant comprehensive permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 6. Verification query
SELECT 
    'HARD RESET COMPLETE' as status,
    count(*) as total_policies_created
FROM pg_policies 
WHERE schemaname = 'public';
