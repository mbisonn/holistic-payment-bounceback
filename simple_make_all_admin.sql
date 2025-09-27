-- Simple script to make all users admin
-- Run this in your Supabase SQL Editor

-- Step 1: Create profiles for all auth users (if they don't exist)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User') as full_name,
    'admin' as role,
    au.created_at,
    NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Step 2: Add admin role to user_roles table for all users
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'admin',
    NOW()
FROM auth.users au
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Add user role as well (some systems expect both)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'user',
    NOW()
FROM auth.users au
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Show results
SELECT 
    p.email,
    p.full_name,
    p.role,
    COUNT(ur.role) as role_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.full_name, p.role
ORDER BY p.created_at DESC;
