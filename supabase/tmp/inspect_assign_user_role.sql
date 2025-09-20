-- Inspect functions named assign_user_role and their definitions
SELECT
  n.nspname AS schema,
  p.proname AS name,
  oidvectortypes(p.proargtypes) AS argtypes,
  p.prosrc,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'assign_user_role'
ORDER BY schema, name, argtypes;
