-- Check ONLY the auth.users table structure
-- Run this to see what columns exist in auth.users

-- Check the structure of auth.users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show sample data from auth.users (first 2 rows, only safe columns)
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
LIMIT 2;
