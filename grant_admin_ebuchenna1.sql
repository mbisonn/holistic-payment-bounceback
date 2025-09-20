-- Grant admin access to ebuchenna1@gmail.com
-- This script ensures the user has admin privileges both in auth metadata and user_roles table

-- 1) Set admin role in auth metadata (for JWT claims)
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
    updated_at = NOW()
WHERE email = 'ebuchenna1@gmail.com';

-- 2) Insert or update user_roles table entry
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';

-- 3) Verify the changes
SELECT 
    u.email,
    u.raw_app_meta_data,
    ur.role as user_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'ebuchenna1@gmail.com';
