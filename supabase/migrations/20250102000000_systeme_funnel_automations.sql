-- Systeme.io-style Funnel Automations Migration
-- This migration creates the enhanced automation system matching Systeme.io's structure

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS public.automation_workflows CASCADE;
DROP TABLE IF EXISTS public.automation_triggers CASCADE;
DROP TABLE IF EXISTS public.automation_actions CASCADE;
DROP TABLE IF EXISTS public.automation_logs CASCADE;

-- Create funnel_automations table (main table for both rules and workflows)
CREATE TABLE IF NOT EXISTS public.funnel_automations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('rule', 'workflow')),
    funnel_id UUID, -- Reference to funnel if applicable
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_triggers table
CREATE TABLE IF NOT EXISTS public.funnel_automation_triggers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.funnel_automations(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_conditions table (for workflow conditions)
CREATE TABLE IF NOT EXISTS public.funnel_automation_conditions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.funnel_automations(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL,
    condition_config JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_actions table
CREATE TABLE IF NOT EXISTS public.funnel_automation_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.funnel_automations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_config JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0, -- For delayed actions
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_executions table (for tracking executions)
CREATE TABLE IF NOT EXISTS public.funnel_automation_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.funnel_automations(id),
    customer_email TEXT NOT NULL,
    execution_data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_templates table (for pre-built templates)
CREATE TABLE IF NOT EXISTS public.funnel_automation_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    template_data JSONB NOT NULL, -- Contains the full automation structure
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_automation_analytics table (for performance tracking)
CREATE TABLE IF NOT EXISTS public.funnel_automation_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.funnel_automations(id),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.funnel_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_automation_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funnel_automations
DROP POLICY IF EXISTS "Admins can manage funnel automations" ON public.funnel_automations;
CREATE POLICY "Admins can manage funnel automations"
ON public.funnel_automations
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_triggers
DROP POLICY IF EXISTS "Admins can manage automation triggers" ON public.funnel_automation_triggers;
CREATE POLICY "Admins can manage automation triggers"
ON public.funnel_automation_triggers
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_conditions
DROP POLICY IF EXISTS "Admins can manage automation conditions" ON public.funnel_automation_conditions;
CREATE POLICY "Admins can manage automation conditions"
ON public.funnel_automation_conditions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_actions
DROP POLICY IF EXISTS "Admins can manage automation actions" ON public.funnel_automation_actions;
CREATE POLICY "Admins can manage automation actions"
ON public.funnel_automation_actions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_executions
DROP POLICY IF EXISTS "Admins can view automation executions" ON public.funnel_automation_executions;
CREATE POLICY "Admins can view automation executions"
ON public.funnel_automation_executions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_templates
DROP POLICY IF EXISTS "Admins can manage automation templates" ON public.funnel_automation_templates;
CREATE POLICY "Admins can manage automation templates"
ON public.funnel_automation_templates
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create RLS policies for funnel_automation_analytics
DROP POLICY IF EXISTS "Admins can view automation analytics" ON public.funnel_automation_analytics;
CREATE POLICY "Admins can view automation analytics"
ON public.funnel_automation_analytics
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_funnel_automations_updated_at ON public.funnel_automations;
CREATE TRIGGER update_funnel_automations_updated_at
    BEFORE UPDATE ON public.funnel_automations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_automations_type ON public.funnel_automations(type);
CREATE INDEX IF NOT EXISTS idx_funnel_automations_active ON public.funnel_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_triggers_automation_id ON public.funnel_automation_triggers(automation_id);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_actions_automation_id ON public.funnel_automation_actions(automation_id);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_executions_automation_id ON public.funnel_automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_executions_customer_email ON public.funnel_automation_executions(customer_email);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_executions_status ON public.funnel_automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_analytics_automation_id ON public.funnel_automation_analytics(automation_id);
CREATE INDEX IF NOT EXISTS idx_funnel_automation_analytics_metric_date ON public.funnel_automation_analytics(metric_date);

-- Insert Systeme.io-style automation templates
INSERT INTO public.funnel_automation_templates (name, description, category, template_data, is_premium) VALUES
-- Lead Capture Rule
('Lead Capture', 'Add tag and subscribe to welcome series when funnel form is submitted', 'Lead Generation', 
'{"type": "rule", "triggers": [{"type": "form_submitted", "config": {"form_type": "opt_in"}}], "actions": [{"type": "assign_tag", "config": {"tag": "Lead"}, "delay": 0}, {"type": "subscribe_campaign", "config": {"campaign": "Welcome Series"}, "delay": 0}, {"type": "send_email", "config": {"template": "welcome_email"}, "delay": 0}]}', false),

-- Purchase Completed Rule
('Purchase Completed', 'Tag customer, subscribe to onboarding, and notify team when purchase is confirmed', 'E-commerce',
'{"type": "rule", "triggers": [{"type": "purchase_completed", "config": {}}], "actions": [{"type": "assign_tag", "config": {"tag": "Customer"}, "delay": 0}, {"type": "subscribe_campaign", "config": {"campaign": "Onboarding"}, "delay": 0}, {"type": "remove_tag", "config": {"tag": "Lead"}, "delay": 0}, {"type": "notify_team", "config": {"method": "email"}, "delay": 0}]}', false),

-- Abandoned Checkout Rule
('Abandoned Checkout', 'Tag and send recovery email when checkout is started but not completed', 'E-commerce',
'{"type": "rule", "triggers": [{"type": "checkout_abandoned", "config": {"timeout_minutes": 30}}], "actions": [{"type": "assign_tag", "config": {"tag": "Cart Abandoned"}, "delay": 0}, {"type": "send_email", "config": {"template": "complete_order"}, "delay": 60}, {"type": "subscribe_campaign", "config": {"campaign": "Abandonment Recovery"}, "delay": 0}]}', false),

-- Webinar Registration Rule
('Webinar Registration', 'Tag and subscribe to reminder sequence when registered for webinar', 'Events',
'{"type": "rule", "triggers": [{"type": "webinar_registered", "config": {}}], "actions": [{"type": "assign_tag", "config": {"tag": "Webinar Registered"}, "delay": 0}, {"type": "subscribe_campaign", "config": {"campaign": "Webinar Reminder Sequence"}, "delay": 0}]}', false),

-- Lead Nurturing Workflow
('Lead Nurturing Workflow', 'Multi-step nurturing sequence with conditional logic', 'Lead Nurturing',
'{"type": "workflow", "triggers": [{"type": "tag_added", "config": {"tag": "Lead"}}], "conditions": [], "actions": [{"type": "send_email", "config": {"template": "welcome_email"}, "delay": 1440}, {"type": "send_email", "config": {"template": "value_email_1"}, "delay": 2880}, {"type": "conditional_action", "config": {"condition": "email_opened", "if_true": {"type": "send_email", "config": {"template": "nurture_email"}}, "if_false": {"type": "send_email", "config": {"template": "resend_different_subject"}}}, "delay": 2880}, {"type": "send_email", "config": {"template": "offer_email"}, "delay": 4320}]}', false),

-- Abandoned Cart Recovery Workflow
('Abandoned Cart Recovery', 'Progressive recovery sequence with social proof and discount', 'E-commerce',
'{"type": "workflow", "triggers": [{"type": "tag_added", "config": {"tag": "Cart Abandoned"}}], "conditions": [], "actions": [{"type": "send_email", "config": {"template": "cart_recovery_1", "include_product_link": true}, "delay": 60}, {"type": "send_email", "config": {"template": "cart_recovery_2", "include_testimonials": true}, "delay": 1440}, {"type": "send_email", "config": {"template": "cart_recovery_3", "include_discount": true}, "delay": 2880}]}', false),

-- Post-Purchase Onboarding Workflow
('Post-Purchase Onboarding', 'Complete onboarding sequence with upsell opportunities', 'Customer Experience',
'{"type": "workflow", "triggers": [{"type": "tag_added", "config": {"tag": "Customer"}}], "conditions": [], "actions": [{"type": "send_email", "config": {"template": "thank_you_confirmation"}, "delay": 0}, {"type": "send_email", "config": {"template": "getting_started_guide"}, "delay": 2880}, {"type": "send_email", "config": {"template": "feedback_request"}, "delay": 7200}, {"type": "send_email", "config": {"template": "upsell_offer"}, "delay": 10080}]}', false),

-- Webinar Sequence Workflow
('Webinar Sequence', 'Complete webinar lifecycle with attendance tracking', 'Events',
'{"type": "workflow", "triggers": [{"type": "tag_added", "config": {"tag": "Webinar Registered"}}], "conditions": [], "actions": [{"type": "send_email", "config": {"template": "webinar_confirmation"}, "delay": 0}, {"type": "send_email", "config": {"template": "webinar_reminder_24h"}, "delay": 1440}, {"type": "send_email", "config": {"template": "webinar_reminder_1h"}, "delay": 60}, {"type": "conditional_action", "config": {"condition": "webinar_attended", "if_true": {"type": "send_email", "config": {"template": "replay_plus_offer"}}, "if_false": {"type": "send_email", "config": {"template": "replay_only"}}}, "delay": 0}]}', false);

-- Create a view for backward compatibility (when automation_rules table exists)
CREATE OR REPLACE VIEW public.automation_rules_view AS
SELECT 
    fa.id,
    fa.name,
    fa.description,
    fat.trigger_type as trigger,
    faa.action_type as action,
    fat.trigger_config as trigger_data,
    faa.action_config as action_data,
    fa.is_active,
    fa.type as automation_type,
    fa.funnel_id,
    fa.created_at,
    fa.updated_at,
    'systeme' as system_type
FROM public.funnel_automations fa
LEFT JOIN public.funnel_automation_triggers fat ON fa.id = fat.automation_id
LEFT JOIN public.funnel_automation_actions faa ON fa.id = faa.automation_id
WHERE fa.type = 'rule';

-- Grant permissions
GRANT ALL ON public.funnel_automations TO authenticated;
GRANT ALL ON public.funnel_automation_triggers TO authenticated;
GRANT ALL ON public.funnel_automation_conditions TO authenticated;
GRANT ALL ON public.funnel_automation_actions TO authenticated;
GRANT ALL ON public.funnel_automation_executions TO authenticated;
GRANT ALL ON public.funnel_automation_templates TO authenticated;
GRANT ALL ON public.funnel_automation_analytics TO authenticated;
GRANT SELECT ON public.automation_rules_view TO authenticated;










