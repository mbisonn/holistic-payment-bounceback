-- Fix Access Request Functions for User Center
-- Run this in Supabase Dashboard SQL Editor

-- Create access request functions
DROP FUNCTION IF EXISTS public.create_access_request(text, text);
CREATE FUNCTION public.create_access_request(user_email text, request_reason text DEFAULT 'Access request')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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
AS $$
BEGIN
  UPDATE public.user_access_requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION public.create_access_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid) TO authenticated;

-- Verify functions were created
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_access_request', 'approve_access_request', 'reject_access_request')
ORDER BY routine_name;
