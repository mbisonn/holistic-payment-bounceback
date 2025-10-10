-- Create WhatsApp settings table
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_provider TEXT NOT NULL CHECK (api_provider IN ('twilio', 'whatsapp_business_api')),
  api_key TEXT NOT NULL,
  api_secret TEXT,
  phone_number TEXT NOT NULL,
  phone_number_id TEXT,
  webhook_verify_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create WhatsApp templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[],
  category TEXT DEFAULT 'marketing',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on WhatsApp tables
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for WhatsApp tables
CREATE POLICY "Authenticated users can view whatsapp settings"
  ON public.whatsapp_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage whatsapp settings"
  ON public.whatsapp_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view whatsapp templates"
  ON public.whatsapp_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage whatsapp messages"
  ON public.whatsapp_messages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage whatsapp campaigns"
  ON public.whatsapp_campaigns FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create Google My Business settings table for reputation management
CREATE TABLE IF NOT EXISTS public.google_business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  place_id TEXT NOT NULL,
  business_id TEXT,
  api_key TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.google_business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view google business settings"
  ON public.google_business_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage google business settings"
  ON public.google_business_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Update reviews table to ensure proper RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));