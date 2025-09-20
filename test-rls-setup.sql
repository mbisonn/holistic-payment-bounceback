-- Test 1: Check admin users have correct access
WITH admin_users AS (
  SELECT id, email 
  FROM auth.users 
  WHERE email IN (
    'ebuchenna1@gmail.com',
    'info@bouncebacktolifeconsult.pro',
    'bouncebacktolifeconsult@gmail.com'
  )
)
SELECT 
  u.email,
  p.role as profile_role,
  array_agg(ur.role) as user_roles,
  public.is_admin(u.id) as is_admin
FROM 
  auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE 
  u.email IN (SELECT email FROM admin_users)
GROUP BY 
  u.email, p.role, u.id;

-- Test 2: Check RLS is enabled on all required tables
SELECT 
  table_schema,
  table_name,
  row_security_active
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles',
    'user_roles',
    'products',
    'orders',
    'order_items',
    'email_settings',
    'email_templates',
    'email_campaigns'
  )
ORDER BY 
  table_name;

-- Test 3: Check existing policies
SELECT 
  n.nspname as schema,
  c.relname as table,
  p.policyname as policy_name,
  p.cmd as command,
  p.permissive,
  p.roles,
  p.qual as using_expression
FROM 
  pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  LEFT JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE 
  n.nspname = 'public'
  AND c.relname IN (
    'profiles',
    'user_roles',
    'products',
    'orders',
    'order_items',
    'email_settings',
    'email_templates',
    'email_campaigns'
  )
ORDER BY 
  c.relname, p.policyname;

-- Test 4: Verify trigger function exists
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  l.lanname as language,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) as function_definition
FROM 
  pg_proc p
  LEFT JOIN pg_language l ON p.prolang = l.oid
WHERE 
  p.proname = 'handle_new_user';

-- Test 5: Check if trigger exists
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
  END as status,
  t.tgisinternal as is_internal
FROM 
  pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_proc p ON t.tgfoid = p.oid
WHERE 
  t.tgname = 'on_auth_user_created';
