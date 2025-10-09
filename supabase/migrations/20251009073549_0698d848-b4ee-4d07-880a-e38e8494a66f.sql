-- Allow all authenticated users to view all users in user center
-- This updates the RLS policies to allow all authenticated users to see all users

-- First, let's update the profiles table policies to allow all authenticated users to see all profiles
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_all_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Update user_roles to allow all authenticated users to see roles
DROP POLICY IF EXISTS "user_roles_select_authenticated" ON public.user_roles;

CREATE POLICY "user_roles_select_authenticated"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);