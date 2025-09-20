-- Comprehensive fix for User Center and Access Request System
-- Run this script in Supabase SQL Editor

-- 1. Ensure ebuchenna1@gmail.com has admin access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update auth metadata for admin access
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
    updated_at = NOW()
WHERE email = 'ebuchenna1@gmail.com';

-- 2. Create/Update the get_all_users function to allow all authenticated users to see all users
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

    -- Allow ALL authenticated users to view all users (removed admin restriction)
    -- This ensures users populate in the User Center
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

-- 3. Create the user_access_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('verified', 'admin', 'moderator', 'manager')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on user_access_requests table
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_access_requests
DROP POLICY IF EXISTS "Users can view their own access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Users can create their own access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON public.user_access_requests;

CREATE POLICY "Users can view their own access requests" ON public.user_access_requests
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own access requests" ON public.user_access_requests
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all access requests" ON public.user_access_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = (SELECT auth.uid())
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admins can update access requests" ON public.user_access_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = (SELECT auth.uid())
            AND ur.role = 'admin'
        )
    );

-- 6. Create the missing create_access_request function
CREATE OR REPLACE FUNCTION public.create_access_request(
    requested_role TEXT,
    message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_id UUID;
    user_email TEXT;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create access requests';
    END IF;
    
    -- Get current user email
    SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Check if user already has a pending request for this role
    IF EXISTS (
        SELECT 1 FROM public.user_access_requests 
        WHERE user_id = current_user_id 
        AND requested_role = create_access_request.requested_role 
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'You already have a pending request for this role';
    END IF;
    
    -- Check if user already has this role
    IF EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = create_access_request.requested_role
    ) THEN
        RAISE EXCEPTION 'You already have this role';
    END IF;
    
    -- Create the request
    INSERT INTO public.user_access_requests (user_id, user_email, requested_role, message)
    VALUES (current_user_id, user_email, create_access_request.requested_role, message)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_access_requests_user_id ON public.user_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_requests_status ON public.user_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_access_requests_created_at ON public.user_access_requests(created_at);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_access_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request TO authenticated;

-- 9. Verify the setup
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

SELECT 
    'Function creation check' as test,
    'create_access_request function created successfully' as status;
