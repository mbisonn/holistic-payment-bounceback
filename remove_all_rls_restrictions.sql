-- Remove all RLS restrictions and give unrestricted access to all users
-- Run this in Supabase SQL Editor

-- 1. Drop all existing RLS policies
DO $$
DECLARE
    r RECORD;
    pol RECORD;
BEGIN
    -- Get all tables in public schema
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'pg_stat_statements', 'schema_migrations', 'supabase_migrations')
    LOOP
        -- Drop all existing policies
        FOR pol IN
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = r.schemaname 
            AND tablename = r.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                pol.policyname, r.schemaname, r.tablename);
        END LOOP;
    END LOOP;
END $$;

-- 2. Disable RLS on all tables (this removes all restrictions)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'pg_stat_statements', 'schema_migrations', 'supabase_migrations')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. Grant all permissions to anon users (for public access if needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 5. Create or update helper functions to always return true
DROP FUNCTION IF EXISTS public.current_user_is_admin();
CREATE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true - no restrictions
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.current_user_is_verified();
CREATE FUNCTION public.current_user_is_verified()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true - no restrictions
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, text);
CREATE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true - no restrictions
  RETURN true;
END;
$$;

-- 6. Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_verified() TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;

-- 7. Create function to get all users (for user management)
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

GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO anon;

-- 8. Ensure all tables have proper permissions
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations')
    LOOP
        -- Grant all permissions on each table
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', table_name);
        EXECUTE format('GRANT ALL ON public.%I TO anon', table_name);
    END LOOP;
END $$;

-- 9. Create a simple policy that allows everything (if RLS is ever re-enabled)
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations')
    LOOP
        -- Create a permissive policy that allows everything
        EXECUTE format('CREATE POLICY IF NOT EXISTS "allow_all_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', table_name, table_name);
    END LOOP;
END $$;

-- 10. Final verification - show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename NOT IN ('spatial_ref_sys', 'pg_stat_statements', 'schema_migrations', 'supabase_migrations')
ORDER BY tablename;
