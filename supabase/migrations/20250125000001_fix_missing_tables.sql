-- Fix missing tables and columns
-- Create user_access_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_access_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    reason text DEFAULT 'Access request',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add reason column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_access_requests' 
        AND column_name = 'reason' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_access_requests ADD COLUMN reason TEXT DEFAULT 'Access request';
    END IF;
END $$;

-- Create other missing tables that might be referenced
CREATE TABLE IF NOT EXISTS public.meal_plan_sync (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_email text NOT NULL,
    customer_name text,
    customer_phone text,
    external_user_id text,
    meal_plan_data jsonb,
    synced_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Grant permissions
GRANT ALL ON public.user_access_requests TO authenticated;
GRANT ALL ON public.user_access_requests TO anon;
GRANT ALL ON public.meal_plan_sync TO authenticated;
GRANT ALL ON public.meal_plan_sync TO anon;
