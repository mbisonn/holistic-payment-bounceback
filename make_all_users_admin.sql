-- Make all current users in Supabase admin
-- This will ensure they appear in the User Center

-- First, let's see what users we have
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- Create profiles for any users that don't have them
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.user_metadata->>'full_name', au.user_metadata->>'name', 'User') as full_name,
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Make all users admin by adding admin role to user_roles table
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'admin'::text,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'admin'
);

-- Also ensure they have a 'user' role (in case the system expects both)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    au.id,
    'user'::text,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'user'
);

-- Update profiles table to mark all users as admin
UPDATE public.profiles 
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users);

-- Show the results
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    array_agg(ur.role) as roles,
    p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.full_name, p.role, p.created_at
ORDER BY p.created_at DESC;
