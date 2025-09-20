-- Create user_roles table and app_role enum first
-- Run this in Supabase Dashboard SQL Editor BEFORE running dashboard_sql_fix.sql

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

-- 3. Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create basic policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated 
USING (true); -- Temporary permissive policy

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- 6. Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
