-- Diagnostic script to check the auth.users table structure
-- Run this first to see what columns are available

-- Check the structure of auth.users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show sample data from auth.users (first 3 rows)
SELECT *
FROM auth.users
LIMIT 3;

-- Check if profiles table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if user_roles table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;
