-- INSTRUCTIONS: Copy and paste this SQL into your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/[your-project-id]/sql
-- Paste this entire script and click "Run"

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

-- Drop all existing restrictive RLS policies (only for tables that exist)
DO $$
DECLARE
    table_name TEXT;
    policy_name TEXT;
BEGIN
    -- Drop policies for existing tables only
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
    LOOP
        -- Drop common policy patterns for each existing table
        FOR policy_name IN 
            SELECT pol.policyname 
            FROM pg_policies pol 
            WHERE pol.schemaname = 'public' 
            AND pol.tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- Create permissive policies for all authenticated users (only for existing tables)
DO $$
DECLARE
    table_name TEXT;
BEGIN
    -- Create policies for existing tables only
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations')
    LOOP
        -- Enable RLS for each table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        
        -- Create permissive policy for authenticated users
        EXECUTE format('CREATE POLICY "Authenticated users can manage %I" ON public.%I FOR ALL USING (auth.uid() IS NOT NULL)', table_name, table_name);
    END LOOP;
END $$;

-- Grant necessary permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create or update helper functions for role checking
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
CREATE FUNCTION public.has_role(user_id uuid, role_name text)
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

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
