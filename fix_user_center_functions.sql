-- Fix User Center Edge Functions
-- This script creates all missing functions for the user center

-- 1. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.user_access_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text NOT NULL,
    reason text DEFAULT 'Access request',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on tables
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create optimized RLS policies
DROP POLICY IF EXISTS "authenticated_access_user_access_requests" ON public.user_access_requests;
CREATE POLICY "authenticated_access_user_access_requests" ON public.user_access_requests
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_access_user_roles" ON public.user_roles;
CREATE POLICY "authenticated_access_user_roles" ON public.user_roles
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- 4. Create all required functions with proper search_path
DROP FUNCTION IF EXISTS public.create_access_request(text, text);
CREATE FUNCTION public.create_access_request(user_email text, request_reason text DEFAULT 'Access request')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id uuid;
BEGIN
  INSERT INTO public.user_access_requests (user_email, reason, status)
  VALUES (user_email, request_reason, 'pending')
  RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;

DROP FUNCTION IF EXISTS public.approve_access_request(uuid);
CREATE FUNCTION public.approve_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  UPDATE public.user_access_requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, text);
CREATE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow all authenticated users to view data
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- For admin-specific actions, check actual role
  IF role_name = 'admin' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = has_role.user_id 
      AND role = 'admin'
    );
  END IF;
  
  -- For general access, allow all authenticated users
  RETURN true;
END;
$$;

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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    COALESCE(ur.role, 'user') as role,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id;
END;
$$;

-- 5. Grant all necessary permissions
GRANT ALL ON public.user_access_requests TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- 6. Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Verification
SELECT 
    'USER CENTER FUNCTIONS CREATED' as status,
    count(*) as total_functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_access_request', 'approve_access_request', 'reject_access_request', 'has_role', 'get_all_users');
