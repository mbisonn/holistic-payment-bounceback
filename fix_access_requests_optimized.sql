-- Optimized Access Requests Setup with Performance and Security Fixes
-- This script addresses Supabase linter warnings for better performance and security

-- ============================================================================
-- 1. DROP EXISTING POLICIES (IGNORE ERRORS IF THEY DON'T EXIST)
-- ============================================================================

-- Drop user_access_requests policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Users can create their own access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Admins can view all access requests" ON public.user_access_requests;
    DROP POLICY IF EXISTS "Admins can update access requests" ON public.user_access_requests;
EXCEPTION
    WHEN OTHERS THEN
        -- Policies might not exist, continue
        NULL;
END $$;

-- Drop user_roles policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "user_roles_select_combined" ON public.user_roles;
EXCEPTION
    WHEN OTHERS THEN
        -- Policies might not exist, continue
        NULL;
END $$;

-- ============================================================================
-- 2. CREATE/REPLACE FUNCTIONS WITH SECURITY FIXES
-- ============================================================================

-- Create access request function with search_path security
CREATE OR REPLACE FUNCTION public.create_access_request(
    p_reason TEXT,
    p_business_justification TEXT DEFAULT NULL,
    p_expected_usage TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_id UUID;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create access requests';
    END IF;

    -- Check if user already has a pending request
    IF EXISTS (
        SELECT 1 FROM public.user_access_requests 
        WHERE user_id = auth.uid() 
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'You already have a pending access request';
    END IF;

    -- Create the access request
    INSERT INTO public.user_access_requests (
        user_id,
        reason,
        business_justification,
        expected_usage,
        status,
        created_at
    ) VALUES (
        auth.uid(),
        p_reason,
        p_business_justification,
        p_expected_usage,
        'pending',
        NOW()
    ) RETURNING id INTO request_id;

    RETURN request_id;
END;
$$;

-- Create approve access request function with search_path security
CREATE OR REPLACE FUNCTION public.approve_access_request(
    p_request_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_record RECORD;
    current_user_id UUID;
BEGIN
    -- Get current user ID (optimized)
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is admin (optimized)
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve access requests';
    END IF;

    -- Get the request
    SELECT * INTO request_record 
    FROM public.user_access_requests 
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;

    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Only pending requests can be approved';
    END IF;

    -- Update the request
    UPDATE public.user_access_requests 
    SET 
        status = 'approved',
        admin_notes = p_admin_notes,
        reviewed_at = NOW(),
        reviewed_by = current_user_id
    WHERE id = p_request_id;

    -- Grant verified role to the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (request_record.user_id, 'verified')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN TRUE;
END;
$$;

-- Create reject access request function with search_path security
CREATE OR REPLACE FUNCTION public.reject_access_request(
    p_request_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_record RECORD;
    current_user_id UUID;
BEGIN
    -- Get current user ID (optimized)
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is admin (optimized)
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject access requests';
    END IF;

    -- Get the request
    SELECT * INTO request_record 
    FROM public.user_access_requests 
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;

    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Only pending requests can be rejected';
    END IF;

    -- Update the request
    UPDATE public.user_access_requests 
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        reviewed_at = NOW(),
        reviewed_by = current_user_id
    WHERE id = p_request_id;

    RETURN TRUE;
END;
$$;

-- Create function to get all users (for admin user management)
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
    -- Get current user ID (optimized)
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is admin (optimized)
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can view all users';
    END IF;

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

-- ============================================================================
-- 3. CREATE OPTIMIZED RLS POLICIES
-- ============================================================================

-- Create optimized user_access_requests policies (consolidated for performance)
DO $$
BEGIN
    -- Single consolidated SELECT policy for user_access_requests
    CREATE POLICY "user_access_requests_select_optimized" ON public.user_access_requests
        FOR SELECT USING (
            -- Users can view their own requests OR admins can view all
            user_id = (SELECT auth.uid()) 
            OR 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = (SELECT auth.uid()) 
                AND role = 'admin'
            )
        );

    -- Single consolidated INSERT policy
    CREATE POLICY "user_access_requests_insert_optimized" ON public.user_access_requests
        FOR INSERT WITH CHECK (
            user_id = (SELECT auth.uid())
        );

    -- Single consolidated UPDATE policy for admins
    CREATE POLICY "user_access_requests_update_optimized" ON public.user_access_requests
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = (SELECT auth.uid()) 
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN
        -- Policies already exist, ignore
        NULL;
END $$;

-- Create optimized user_roles policy
DO $$
BEGIN
    CREATE POLICY "user_roles_select_optimized" ON public.user_roles
        FOR SELECT USING (
            -- Users can view their own roles OR admins can view all
            user_id = (SELECT auth.uid()) 
            OR 
            EXISTS (
                SELECT 1 FROM public.user_roles ur 
                WHERE ur.user_id = (SELECT auth.uid()) 
                AND ur.role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, ignore
        NULL;
END $$;

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
DO $$
BEGIN
    GRANT EXECUTE ON FUNCTION public.create_access_request TO authenticated;
    GRANT EXECUTE ON FUNCTION public.approve_access_request TO authenticated;
    GRANT EXECUTE ON FUNCTION public.reject_access_request TO authenticated;
    GRANT EXECUTE ON FUNCTION public.get_all_users TO authenticated;
EXCEPTION
    WHEN OTHERS THEN
        -- Permissions might already exist, continue
        NULL;
END $$;

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better query performance
DO $$
BEGIN
    -- Index for user_access_requests queries
    CREATE INDEX IF NOT EXISTS idx_user_access_requests_user_id_status 
    ON public.user_access_requests(user_id, status);
    
    CREATE INDEX IF NOT EXISTS idx_user_access_requests_status_created 
    ON public.user_access_requests(status, created_at);
    
    -- Index for user_roles queries
    CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
    ON public.user_roles(user_id, role);
EXCEPTION
    WHEN OTHERS THEN
        -- Indexes might already exist, continue
        NULL;
END $$;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Verify the setup
DO $$
DECLARE
    table_exists BOOLEAN;
    function_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_access_requests'
    ) INTO table_exists;
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('create_access_request', 'approve_access_request', 'reject_access_request');
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_access_requests';
    
    -- Output results
    RAISE NOTICE 'Setup verification:';
    RAISE NOTICE '  Table exists: %', table_exists;
    RAISE NOTICE '  Functions created: %', function_count;
    RAISE NOTICE '  Policies created: %', policy_count;
    
    IF table_exists AND function_count = 3 AND policy_count >= 3 THEN
        RAISE NOTICE '✅ Access requests system setup completed successfully!';
    ELSE
        RAISE NOTICE '⚠️  Setup incomplete. Please check the errors above.';
    END IF;
END $$;
