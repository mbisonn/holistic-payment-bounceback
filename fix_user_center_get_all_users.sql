-- Fix the get_all_users function for User Center
-- This will allow the User Center to properly display all users

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_all_users();

-- Create a new get_all_users function that works with the current schema
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
SET search_path = public, auth
AS $$
BEGIN
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO anon;

-- Also create a simpler version that works with profiles table as fallback
CREATE OR REPLACE FUNCTION public.get_all_users_from_profiles()
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
BEGIN
    -- Return users from profiles table
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.created_at,
        p.email_confirmed_at,
        COALESCE(p.user_metadata, '{}'::jsonb) as user_metadata
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_users_from_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_from_profiles() TO anon;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
