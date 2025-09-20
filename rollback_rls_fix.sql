-- Copy and run this in your Supabase SQL Editor (https://app.supabase.com/project/ytqruetuadthefyclmiq/sql/editor)
-- This will restore basic functionality by fixing RLS policies

BEGIN;

-- 1. Fix abandoned_checkouts policies
DROP POLICY IF EXISTS "View abandoned checkouts" ON public.abandoned_checkouts;

-- Recreate original policies
CREATE POLICY abandoned_checkouts_admin_select ON public.abandoned_checkouts
  FOR SELECT TO authenticated USING (
    public.has_role((SELECT auth.uid()), 'admin'::app_role) OR 
    public.has_role((SELECT auth.uid()), 'manager'::app_role)
  );

-- 2. Fix orders policies
CREATE POLICY IF NOT EXISTS "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR
    public.has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- 3. Fix email_templates policies
DROP POLICY IF EXISTS "View email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Manage email templates" ON public.email_templates;

CREATE POLICY email_templates_public_select ON public.email_templates
  FOR SELECT TO authenticated USING (true);

-- 4. Ensure critical functions exist
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.has_role((SELECT auth.uid()), 'admin'::app_role);
$$;

-- 5. Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_user_id ON public.abandoned_checkouts(user_id);

-- 6. Enable RLS on all tables and add basic select policy
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'pg_stat_statements')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', r.tablename);
        
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = r.tablename 
            AND policyname = 'enable_select_for_authenticated'
        ) THEN
            EXECUTE format(
                'CREATE POLICY enable_select_for_authenticated ON %I 
                FOR SELECT TO authenticated USING (true);', 
                r.tablename
            );
        END IF;
    END LOOP;
END
$$;

COMMIT;
