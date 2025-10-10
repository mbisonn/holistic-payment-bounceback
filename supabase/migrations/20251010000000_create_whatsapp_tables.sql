-- Create WhatsApp settings table
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_provider TEXT NOT NULL CHECK (api_provider IN ('twilio', 'whatsapp_business_api', 'vonage')),
  api_key TEXT NOT NULL,
  api_secret TEXT,
  phone_number TEXT NOT NULL,
  phone_number_id TEXT,
  business_account_id TEXT,
  webhook_url TEXT,
  webhook_verify_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create WhatsApp messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  message_sid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'received')),
  message_body TEXT NOT NULL,
  media_url TEXT,
  media_content_type TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for whatsapp_messages
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_phone ON public.whatsapp_messages(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_email ON public.whatsapp_messages(customer_email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);

-- Create WhatsApp templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'en' NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  template_body TEXT NOT NULL,
  header_text TEXT,
  footer_text TEXT,
  buttons JSON,
  variables JSON,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  template_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create WhatsApp campaigns table
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  target_tags TEXT[],
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed', 'paused')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for whatsapp_campaigns
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON public.whatsapp_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_scheduled_at ON public.whatsapp_campaigns(scheduled_at);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for whatsapp_settings
CREATE POLICY "Enable read access for authenticated users" ON public.whatsapp_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.whatsapp_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.whatsapp_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.whatsapp_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for whatsapp_messages
CREATE POLICY "Enable read access for authenticated users" ON public.whatsapp_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.whatsapp_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.whatsapp_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for whatsapp_templates
CREATE POLICY "Enable read access for authenticated users" ON public.whatsapp_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.whatsapp_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.whatsapp_templates
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.whatsapp_templates
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for whatsapp_campaigns
CREATE POLICY "Enable read access for authenticated users" ON public.whatsapp_campaigns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.whatsapp_campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.whatsapp_campaigns
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.whatsapp_campaigns
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_whatsapp_settings_updated_at
    BEFORE UPDATE ON public.whatsapp_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_whatsapp_messages_updated_at
    BEFORE UPDATE ON public.whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_whatsapp_templates_updated_at
    BEFORE UPDATE ON public.whatsapp_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_whatsapp_campaigns_updated_at
    BEFORE UPDATE ON public.whatsapp_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
