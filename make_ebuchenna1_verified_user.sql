-- Make ebuchenna1@gmail.com a verified user and regular user
-- This adds additional roles to the existing admin user

-- First, let's see the current status of this user
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    array_agg(ur.role) as current_roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'ebuchenna1@gmail.com'
GROUP BY p.id, p.email, p.full_name, p.role;

-- Add 'verified' role to user_roles table for ebuchenna1@gmail.com
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    p.id,
    'verified',
    NOW()
FROM public.profiles p
WHERE p.email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add 'user' role to user_roles table for ebuchenna1@gmail.com (if not already exists)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    p.id,
    'user',
    NOW()
FROM public.profiles p
WHERE p.email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the profiles table to mark as verified (if there's a verified field)
-- This is optional - some systems use the user_roles table for verification status
UPDATE public.profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'ebuchenna1@gmail.com';

-- Show the final results
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    array_agg(ur.role ORDER BY ur.role) as all_roles,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'ebuchenna1@gmail.com'
GROUP BY p.id, p.email, p.full_name, p.role, p.created_at, p.updated_at;
