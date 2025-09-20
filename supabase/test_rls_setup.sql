-- Test script to verify RLS setup for automation_rules table
-- Run this in your Supabase SQL editor to check the current state

-- 1. Check current user authentication status
SELECT 
    auth.uid() as current_user_id,
    auth.role() as auth_role;

-- 2. Check if user_roles table exists and has data
SELECT 
    COUNT(*) as total_user_roles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM public.user_roles;

-- 3. Check current user's role
SELECT 
    ur.user_id,
    ur.role,
    u.email
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.user_id = auth.uid();

-- 4. Test the get_current_user_role function
SELECT get_current_user_role() as user_role;

-- 5. Test the debug function
SELECT * FROM debug_user_role();

-- 6. Check automation_rules table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'automation_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Check existing RLS policies on automation_rules
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'automation_rules';

-- 8. Test if current user can access automation_rules (this should return rows if RLS is working)
SELECT 
    name,
    trigger,
    action,
    is_active
FROM public.automation_rules
LIMIT 5;

-- 9. If the above fails, check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'automation_rules';

-- 10. Check if there are any existing automation_rules records
SELECT COUNT(*) as total_automation_rules FROM public.automation_rules;
