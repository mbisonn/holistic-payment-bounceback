-- Comprehensive fix for all database issues
-- Run this script in Supabase SQL Editor

-- 1. Create missing tables first
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

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'verified', 'user', 'moderator', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2. Ensure ebuchenna1@gmail.com has admin access
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

-- 3. Create get_all_users function
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
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can view all users';
    END IF;

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

-- 4. Create access request functions
CREATE OR REPLACE FUNCTION public.create_access_request(
    p_requested_role TEXT,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    request_id UUID;
BEGIN
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    INSERT INTO public.user_access_requests (user_id, user_email, requested_role, message)
    VALUES (current_user_id, current_user_email, p_requested_role, p_message)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_access_request(
    p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    request_record RECORD;
BEGIN
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve access requests';
    END IF;
    
    -- Get request details
    SELECT * INTO request_record FROM public.user_access_requests WHERE id = p_request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;
    
    -- Update request status
    UPDATE public.user_access_requests 
    SET status = 'approved', 
        reviewed_by = current_user_id, 
        reviewed_at = NOW()
    WHERE id = p_request_id;
    
    -- Grant the requested role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (request_record.user_id, request_record.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN TRUE;
END;
$$;

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
    current_user_id UUID;
BEGIN
    current_user_id := (SELECT auth.uid());
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject access requests';
    END IF;
    
    UPDATE public.user_access_requests 
    SET status = 'rejected', 
        admin_notes = p_admin_notes,
        reviewed_by = current_user_id, 
        reviewed_at = NOW()
    WHERE id = p_request_id;
    
    RETURN TRUE;
END;
$$;

-- 5. Create helper function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_uuid AND role = role_name
    );
END;
$$;

-- 6. Fix RLS policies for all tables
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own data" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Users can create access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON public.user_access_requests;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Create RLS policies for user_access_requests
CREATE POLICY "Users can view own requests" ON public.user_access_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON public.user_access_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Users can create requests" ON public.user_access_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update requests" ON public.user_access_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_access_requests TO authenticated;

-- 8. Fix products and other content visibility (if tables exist)
-- Enable admin access to products table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        -- Drop existing product policies
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
        
        -- Create admin-friendly policies for products
        CREATE POLICY "Admins can view all products" ON public.products
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
                )
            );
            
        CREATE POLICY "Admins can manage products" ON public.products
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
                )
            );
    END IF;
END $$;

-- 9. Fix orders visibility
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.orders;
        
        CREATE POLICY "Admins can view all orders" ON public.orders
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
                )
            );
            
        CREATE POLICY "Admins can manage orders" ON public.orders
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
                )
            );
    END IF;
END $$;

-- 10. Verification queries
SELECT 'Admin role verification' as check_type, COUNT(*) as count
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'ebuchenna1@gmail.com' AND ur.role = 'admin';

SELECT 'Auth metadata verification' as check_type, 
       email, 
       raw_app_meta_data->'role' as role_in_metadata
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com';
