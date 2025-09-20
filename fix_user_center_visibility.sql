-- Fix User Center visibility issues
-- Run this script in Supabase SQL Editor

-- 1. Ensure ebuchenna1@gmail.com has admin role in user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update auth metadata for admin access
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
    updated_at = NOW()
WHERE email = 'ebuchenna1@gmail.com';

-- 3. Create get_all_users function for User Center
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    user_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can view all users';
    END IF;

    -- Return all users from auth.users
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.email_confirmed_at,
        au.user_metadata
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_users TO authenticated;

-- 5. Verify the setup
SELECT 
    'Admin role check' as test,
    COUNT(*) as count
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'ebuchenna1@gmail.com' AND ur.role = 'admin';

SELECT 
    'Auth metadata check' as test,
    email,
    raw_app_meta_data->'role' as role_in_metadata
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com';
