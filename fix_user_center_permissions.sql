-- Fix User Center Permissions
-- Allow all users to view users, only admins to verify/promote

-- 1. Create admin check function
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
END;
$$;

-- 2. Update user access requests RLS - all users can view, only admins can modify
DROP POLICY IF EXISTS "authenticated_access_user_access_requests" ON public.user_access_requests;

-- Allow all authenticated users to view access requests
CREATE POLICY "view_access_requests" ON public.user_access_requests
FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- Allow all users to create their own access requests
CREATE POLICY "create_own_access_request" ON public.user_access_requests
FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Only admins can update/delete access requests
CREATE POLICY "admin_manage_access_requests" ON public.user_access_requests
FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_access_requests" ON public.user_access_requests
FOR DELETE USING (public.is_admin(auth.uid()));

-- 3. Update user roles RLS - all users can view, only admins can modify
DROP POLICY IF EXISTS "authenticated_access_user_roles" ON public.user_roles;

-- Allow all authenticated users to view user roles
CREATE POLICY "view_user_roles" ON public.user_roles
FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- Only admins can manage user roles
CREATE POLICY "admin_manage_user_roles" ON public.user_roles
FOR ALL USING (public.is_admin(auth.uid()));

-- 4. Update profiles RLS if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "authenticated_access_profiles" ON public.profiles;
    
    -- Allow all authenticated users to view profiles
    CREATE POLICY "view_profiles" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    
    -- Users can update their own profiles
    CREATE POLICY "update_own_profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());
    
    -- Only admins can manage all profiles
    CREATE POLICY "admin_manage_profiles" ON public.profiles
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 5. Update functions to respect admin permissions
DROP FUNCTION IF EXISTS public.approve_access_request(uuid);
CREATE FUNCTION public.approve_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can approve requests
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can approve access requests';
  END IF;
  
  UPDATE public.user_access_requests 
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.reject_access_request(uuid);
CREATE FUNCTION public.reject_access_request(request_id uuid)
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
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

-- 6. Create function to promote user to admin (admin only)
DROP FUNCTION IF EXISTS public.promote_user_to_admin(uuid);
CREATE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can promote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can promote users to admin';
  END IF;
  
  -- Insert or update user role to admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();
  
  RETURN true;
END;
$$;

-- 7. Create function to demote admin (admin only)
DROP FUNCTION IF EXISTS public.demote_admin_to_user(uuid);
CREATE FUNCTION public.demote_admin_to_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can demote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can demote users';
  END IF;
  
  -- Update user role to regular user
  UPDATE public.user_roles 
  SET role = 'user', updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_admin_to_user(uuid) TO authenticated;

-- 9. Verification
SELECT 
    'USER CENTER PERMISSIONS CONFIGURED' as status,
    'All users can view, only admins can verify/promote' as description;
