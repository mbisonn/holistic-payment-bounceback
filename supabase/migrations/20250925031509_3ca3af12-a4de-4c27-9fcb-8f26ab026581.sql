-- Fix the missing 'reason' column in user_access_requests table
-- This column was referenced in the table but didn't exist

-- First, check if the column exists and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_access_requests' 
        AND column_name = 'reason' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_access_requests 
        ADD COLUMN reason TEXT DEFAULT 'Access request';
    END IF;
END $$;

-- Update existing records that might have NULL reason
UPDATE public.user_access_requests 
SET reason = 'Access request' 
WHERE reason IS NULL;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "user_access_requests_own_insert" ON public.user_access_requests;
DROP POLICY IF EXISTS "user_access_requests_own_select" ON public.user_access_requests;

-- Allow all authenticated users to insert their own access requests
CREATE POLICY "user_access_requests_own_insert" 
ON public.user_access_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = user_id::text OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow users to view their own access requests
CREATE POLICY "user_access_requests_own_select" 
ON public.user_access_requests 
FOR SELECT 
TO authenticated 
USING (
  auth.uid()::text = user_id::text 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);