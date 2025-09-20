-- TEMPORARY: Drop all RLS policies and disable RLS on all user tables
-- NOTE: This is intended for local development convenience. Do NOT use in production without care.

-- 1) Drop all policies across all schemas
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END
$$;

-- 2) Disable RLS on all ordinary tables in non-system schemas
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT n.nspname AS schemaname, c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'  -- ordinary tables
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY;', t.schemaname, t.tablename);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY FALSE;', t.schemaname, t.tablename);
  END LOOP;
END
$$;
