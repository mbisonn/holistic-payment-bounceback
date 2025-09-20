-- Complete Database Initialization and Access Fix
-- This script ensures all necessary tables exist and sets up proper access for all authenticated users

-- First, ensure missing columns exist in orders table
DO $$
BEGIN
    -- Add customer_phone column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_phone text;
    END IF;
    
    -- Add delivery_address column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address text;
    END IF;
    
    -- Add delivery_city column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_city'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_city text;
    END IF;
    
    -- Add delivery_state column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_state'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_state text;
    END IF;
END $$;

-- Create missing tables that are referenced in the application
CREATE TABLE IF NOT EXISTS public.upsell_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric NOT NULL DEFAULT 0,
    original_price numeric,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    color text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_email text NOT NULL,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(customer_email, tag_id)
);

CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    template_type text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    template_id uuid REFERENCES public.email_templates(id),
    subject text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'draft',
    scheduled_at timestamptz,
    sent_at timestamptz,
    recipient_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_triggers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    action_config jsonb DEFAULT '{}',
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid REFERENCES public.automation_workflows(id),
    trigger_data jsonb DEFAULT '{}',
    status text DEFAULT 'pending',
    error_message text,
    executed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_plan_sync (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email text NOT NULL,
    meal_plan_data jsonb DEFAULT '{}',
    sync_status text DEFAULT 'pending',
    last_synced_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    template_id uuid REFERENCES public.email_templates(id),
    scheduled_at timestamptz NOT NULL,
    sent_at timestamptz,
    status text DEFAULT 'scheduled',
    error_message text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id uuid,
    recipient_email text NOT NULL,
    event_type text NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'
    event_data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Drop all existing RLS policies for a clean slate
DO $$
DECLARE
    table_name TEXT;
    policy_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
    LOOP
        FOR policy_name IN 
            SELECT pol.policyname 
            FROM pg_policies pol 
            WHERE pol.schemaname = 'public' 
            AND pol.tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- Enable RLS and create permissive policies for all tables
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations')
    LOOP
        -- Enable RLS for each table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        
        -- Create permissive policy for authenticated users
        EXECUTE format('CREATE POLICY "Authenticated users can manage %I" ON public.%I FOR ALL USING (auth.uid() IS NOT NULL)', table_name, table_name);
    END LOOP;
END $$;

-- Grant comprehensive permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Drop and recreate helper functions
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.get_all_users();

-- Create helper function for role checking (returns true for all authenticated users)
CREATE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow access for all authenticated users (both verified users and admins)
  RETURN user_id IS NOT NULL;
END;
$$;

-- Create function to get all users for user center
CREATE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
  FROM public.profiles p;
END;
$$;

-- Create access request functions
DROP FUNCTION IF EXISTS public.create_access_request(text, text);
CREATE FUNCTION public.create_access_request(user_email text, request_reason text DEFAULT 'Access request')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id uuid;
BEGIN
  INSERT INTO public.user_access_requests (user_email, reason, status)
  VALUES (user_email, request_reason, 'pending')
  RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;

DROP FUNCTION IF EXISTS public.approve_access_request(uuid);
CREATE FUNCTION public.approve_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_access_requests 
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.reject_access_request(uuid);
CREATE FUNCTION public.reject_access_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_access_requests 
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid) TO authenticated;

-- Create indexes for better performance (only after tables exist)
DO $$
BEGIN
    -- Only create indexes if the tables and columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_tags' 
        AND column_name = 'customer_email' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_customer_tags_email ON public.customer_tags(customer_email);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_tags' 
        AND column_name = 'tag_id' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_customer_tags_tag_id ON public.customer_tags(tag_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_tracking' 
        AND column_name = 'recipient_email' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_email_tracking_email ON public.email_tracking(recipient_email);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_tracking' 
        AND column_name = 'event_type' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON public.email_tracking(event_type);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_emails' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON public.scheduled_emails(status);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'automation_logs' 
        AND column_name = 'workflow_id' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_automation_logs_workflow ON public.automation_logs(workflow_id);
    END IF;
END $$;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE 'Database initialization completed successfully!';
  RAISE NOTICE 'All authenticated users now have full access to all data.';
  RAISE NOTICE 'Missing tables have been created with proper structure.';
END $$;
