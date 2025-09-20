-- Grant admin access to ebuchenna1@gmail.com
-- Run this script in Supabase SQL Editor

-- First, ensure the user_roles table exists and has the correct structure
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'verified', 'user', 'moderator', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = (SELECT auth.uid())
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Grant admin access to ebuchenna1@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also update the auth metadata for admin access
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
    updated_at = NOW()
WHERE email = 'ebuchenna1@gmail.com';

-- Verify the admin access was granted
SELECT 
    u.email,
    ur.role,
    u.raw_app_meta_data->>'role' as auth_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
WHERE u.email = 'ebuchenna1@gmail.com';
