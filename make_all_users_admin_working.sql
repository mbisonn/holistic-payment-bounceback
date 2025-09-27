-- Working script to make all users admin
-- This script works with the existing table structure

-- Step 1: First, let's see what users we have in auth.users
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- Step 2: Create profiles for all auth users (if they don't exist)
-- Using only the columns we know exist
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'User' as full_name,
    'admin' as role,
    au.created_at,
    NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Step 3: Add admin role to user_roles table for all users
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'admin',
    NOW()
FROM auth.users au
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Add user role as well (some systems expect both)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'user',
    NOW()
FROM auth.users au
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Show final results
SELECT 
    p.email,
    p.full_name,
    p.role,
    array_agg(ur.role) as roles,
    p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.full_name, p.role, p.created_at
ORDER BY p.created_at DESC;
