-- Create automation_rules table for customer automation workflows (idempotent)
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL, -- 'purchase_paystack', 'payment_on_delivery', etc.
  action TEXT NOT NULL, -- 'assign_tag', 'send_email_campaign'
  trigger_data JSONB, -- Additional trigger configuration
  action_data TEXT, -- ID of tag or campaign to assign/send
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_events table for email tracking (idempotent)
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click', 'bounce', 'delivery')),
  recipient TEXT,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  url TEXT, -- For click events
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automation_rules (idempotent)
DROP POLICY IF EXISTS "Admins can manage automation rules" ON public.automation_rules;
CREATE POLICY "Admins can manage automation rules"
ON public.automation_rules
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for email_events (idempotent)
DROP POLICY IF EXISTS "Admins can manage email events" ON public.email_events;
CREATE POLICY "Admins can manage email events"
ON public.email_events
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Add triggers for updated_at columns (idempotent)
DROP TRIGGER IF EXISTS update_automation_rules_updated_at ON public.automation_rules;
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON public.automation_rules(trigger);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON public.automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON public.email_events(message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON public.email_events(campaign_id);