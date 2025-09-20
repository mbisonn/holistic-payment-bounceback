-- Create missing get_all_users RPC function for User Center
-- This function allows viewing all users with proper permissions

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_all_users();

-- Create the get_all_users function
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  user_metadata jsonb,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow all authenticated users to view users (as per requirements)
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Return all users from auth.users with their roles
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.user_metadata,
    COALESCE(ur.role, 'user') as role
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- Also create the missing reject_access_request function with admin_notes parameter
DROP FUNCTION IF EXISTS public.reject_access_request(uuid, text);
CREATE OR REPLACE FUNCTION public.reject_access_request(request_id uuid, admin_notes text DEFAULT 'Access request rejected')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can reject requests
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can reject access requests';
  END IF;
  
  UPDATE public.user_access_requests 
  SET 
    status = 'rejected', 
    updated_at = now(),
    admin_notes = reject_access_request.admin_notes
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid, text) TO authenticated;

-- Verification query
SELECT 
    'USER CENTER FUNCTIONS CREATED' as status,
    'get_all_users and reject_access_request functions are now available' as description;
