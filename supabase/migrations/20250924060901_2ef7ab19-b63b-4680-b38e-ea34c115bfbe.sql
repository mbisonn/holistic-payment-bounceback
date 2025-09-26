-- Drop the conflicting policies to fix infinite recursion
DROP POLICY IF EXISTS "user_roles_select_all_authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_final" ON public.user_roles;

-- Create a single working policy for user_roles that allows all authenticated users to see all roles
CREATE POLICY "user_roles_select_authenticated" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (true);