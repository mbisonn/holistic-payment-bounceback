-- Simple script to add verified and user roles to ebuchenna1@gmail.com
-- Run this in your Supabase SQL Editor

-- Add 'verified' role
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    p.id,
    'verified',
    NOW()
FROM public.profiles p
WHERE p.email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add 'user' role (if not already exists)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    p.id,
    'user',
    NOW()
FROM public.profiles p
WHERE p.email = 'ebuchenna1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Show the final result
SELECT 
    p.email,
    p.full_name,
    p.role as profile_role,
    array_agg(ur.role ORDER BY ur.role) as all_roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'ebuchenna1@gmail.com'
GROUP BY p.id, p.email, p.full_name, p.role;
