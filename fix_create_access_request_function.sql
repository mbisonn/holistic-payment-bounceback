-- Fix the create_access_request function that's missing
-- Run this script in Supabase SQL Editor

-- First, ensure the user_access_requests table exists
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

-- Enable RLS on the table
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_access_requests
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

-- Create the missing create_access_request function
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_access_requests_user_id ON public.user_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_requests_status ON public.user_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_access_requests_created_at ON public.user_access_requests(created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_access_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request TO authenticated;

-- Verify the function was created
SELECT 'create_access_request function created successfully' as status;
