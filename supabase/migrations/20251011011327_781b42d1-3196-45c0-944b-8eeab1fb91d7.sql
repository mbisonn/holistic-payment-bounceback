-- Create whatsapp_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone text NOT NULL,
  customer_name text,
  template_id uuid REFERENCES public.whatsapp_templates(id),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  failed_reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create workflow_nodes table
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  node_type text NOT NULL,
  position_x numeric,
  position_y numeric,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create workflow_connections table
CREATE TABLE IF NOT EXISTS public.workflow_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  source_node_id text NOT NULL,
  target_node_id text NOT NULL,
  source_handle text,
  target_handle text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Admins can manage whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can view workflow nodes" ON public.workflow_nodes;
DROP POLICY IF EXISTS "Admins can manage workflow nodes" ON public.workflow_nodes;
DROP POLICY IF EXISTS "Authenticated users can view workflow connections" ON public.workflow_connections;
DROP POLICY IF EXISTS "Admins can manage workflow connections" ON public.workflow_connections;

-- RLS Policies for whatsapp_messages
CREATE POLICY "Authenticated users can view whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage whatsapp messages"
  ON public.whatsapp_messages FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for workflow_nodes
CREATE POLICY "Authenticated users can view workflow nodes"
  ON public.workflow_nodes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflow nodes"
  ON public.workflow_nodes FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for workflow_connections
CREATE POLICY "Authenticated users can view workflow connections"
  ON public.workflow_connections FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflow connections"
  ON public.workflow_connections FOR ALL
  USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_phone ON public.whatsapp_messages(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON public.workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow_id ON public.workflow_connections(workflow_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_workflow_nodes_updated_at ON public.workflow_nodes;
CREATE TRIGGER update_workflow_nodes_updated_at
  BEFORE UPDATE ON public.workflow_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();