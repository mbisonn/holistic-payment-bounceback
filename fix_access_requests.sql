-- Fix Access Requests System
-- This script creates the necessary table and functions for the access request system

-- Create user access requests table (ignore errors if it already exists)
DO $$ 
BEGIN
    CREATE TABLE IF NOT EXISTS public.user_access_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      user_email TEXT NOT NULL,
      requested_role TEXT NOT NULL CHECK (requested_role IN ('verified', 'admin', 'moderator', 'manager')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      message TEXT,
      admin_notes TEXT,
      reviewed_by UUID REFERENCES auth.users(id),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        -- Table might already exist, continue
        NULL;
END $$;

-- Drop existing policies if they exist (ignore errors if they don't exist)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Users can create their own access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Admins can view all access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Admins can update access requests" ON public.user_access_requests;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- Create RLS policies (ignore errors if they already exist)
DO $$ 
BEGIN
    CREATE POLICY "Users can view their own access requests" ON public.user_access_requests
      FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, ignore
        NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can create their own access requests" ON public.user_access_requests
      FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, ignore
        NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Admins can view all access requests" ON public.user_access_requests
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur 
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, ignore
        NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Admins can update access requests" ON public.user_access_requests
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur 
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, ignore
        NULL;
END $$;

-- Drop existing functions if they exist (ignore errors if they don't exist)
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS public.approve_access_request(UUID);
    DROP FUNCTION IF EXISTS public.reject_access_request(UUID, TEXT);
    DROP FUNCTION IF EXISTS public.create_access_request(TEXT, TEXT);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if functions don't exist
        NULL;
END $$;

-- Create function to handle access request approval
CREATE OR REPLACE FUNCTION public.approve_access_request(request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record 
  FROM public.user_access_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve access requests';
  END IF;
  
  -- Add the requested role to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (request_record.user_id, request_record.requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update the request status
  UPDATE public.user_access_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = request_id;
  
  RAISE NOTICE 'Access request % approved for user %', request_id, request_record.user_email;
END;
$$;

-- Create function to handle access request rejection
CREATE OR REPLACE FUNCTION public.reject_access_request(request_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record 
  FROM public.user_access_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject access requests';
  END IF;
  
  -- Update the request status
  UPDATE public.user_access_requests
  SET 
    status = 'rejected',
    admin_notes = COALESCE(admin_notes, 'Access request rejected'),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = request_id;
  
  RAISE NOTICE 'Access request % rejected for user %', request_id, request_record.user_email;
END;
$$;

-- Create function to create access request
CREATE OR REPLACE FUNCTION public.create_access_request(
  requested_role TEXT,
  message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id UUID;
  user_email TEXT;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user already has a pending request for this role
  IF EXISTS (
    SELECT 1 FROM public.user_access_requests 
    WHERE user_id = auth.uid() 
    AND requested_role = create_access_request.requested_role 
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending request for this role';
  END IF;
  
  -- Check if user already has this role
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = create_access_request.requested_role
  ) THEN
    RAISE EXCEPTION 'You already have this role';
  END IF;
  
  -- Create the request
  INSERT INTO public.user_access_requests (user_id, user_email, requested_role, message)
  VALUES (auth.uid(), user_email, create_access_request.requested_role, message)
  RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;

-- Create indexes for better performance (ignore errors if they already exist)
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS idx_user_access_requests_user_id ON public.user_access_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_access_requests_status ON public.user_access_requests(status);
    CREATE INDEX IF NOT EXISTS idx_user_access_requests_created_at ON public.user_access_requests(created_at);
EXCEPTION
    WHEN OTHERS THEN
        -- Indexes might already exist, continue
        NULL;
END $$;

-- Grant necessary permissions (ignore errors if already granted)
DO $$ 
BEGIN
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT ALL ON public.user_access_requests TO authenticated;
    GRANT EXECUTE ON FUNCTION public.create_access_request(TEXT, TEXT) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.approve_access_request(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.reject_access_request(UUID, TEXT) TO authenticated;
EXCEPTION
    WHEN OTHERS THEN
        -- Permissions might already be granted, continue
        NULL;
END $$;
