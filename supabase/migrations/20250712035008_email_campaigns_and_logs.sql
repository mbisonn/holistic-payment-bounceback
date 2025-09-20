
-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('order_confirmation', 'abandoned_cart', 'upsell', 'downsell', 'status_update', 'custom')),
  placeholders TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('purchase', 'abandoned_cart', 'upsell', 'downsell', 'manual', 'tag_based')),
  trigger_conditions JSONB DEFAULT '{}',
  send_delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint to scheduled_emails table now that email_campaigns exists
ALTER TABLE public.scheduled_emails 
ADD CONSTRAINT fk_scheduled_emails_campaign_id 
FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns(id) ON DELETE SET NULL;

-- Create customer tags table
CREATE TABLE public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customer tag assignments table
CREATE TABLE public.customer_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  tag_id UUID REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_email, tag_id)
);

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Email templates are viewable by admins" ON public.email_templates
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Email campaigns are viewable by admins" ON public.email_campaigns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for customer_tags
CREATE POLICY "Admins can manage customer tags" ON public.customer_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customer tags are viewable by admins" ON public.customer_tags
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for customer_tag_assignments
CREATE POLICY "Admins can manage customer tag assignments" ON public.customer_tag_assignments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customer tag assignments are viewable by admins" ON public.customer_tag_assignments
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for email_logs
CREATE POLICY "Admins can view email logs" ON public.email_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert email logs" ON public.email_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update email logs" ON public.email_logs
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for invoices
CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Invoices are viewable by admins" ON public.invoices
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing columns to orders table for better tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_source TEXT DEFAULT 'website';

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, template_type, placeholders) VALUES
('Order Confirmation', 'Thank you for your order #{ORDER_NUMBER}!', 
'<h1>Thank you {CUSTOMER_NAME}!</h1><p>Your order #{ORDER_NUMBER} has been confirmed.</p><p>Total: {TOTAL_AMOUNT}</p>', 
'order_confirmation', 
ARRAY['CUSTOMER_NAME', 'ORDER_NUMBER', 'TOTAL_AMOUNT', 'ORDER_ITEMS']),

('Abandoned Cart Reminder', 'You left something in your cart!', 
'<h1>Don''t forget your items!</h1><p>Hi {CUSTOMER_NAME}, you left some items in your cart. Complete your purchase now!</p>', 
'abandoned_cart', 
ARRAY['CUSTOMER_NAME', 'CART_ITEMS', 'TOTAL_AMOUNT']),

('Upsell Offer', 'Special offer just for you!', 
'<h1>Exclusive Upsell Offer</h1><p>Hi {CUSTOMER_NAME}, we have a special offer based on your recent purchase!</p>', 
'upsell', 
ARRAY['CUSTOMER_NAME', 'OFFER_DETAILS', 'DISCOUNT_AMOUNT']);

-- Insert default customer tags
INSERT INTO public.customer_tags (name, description, color) VALUES
('New Customer', 'First time buyers', '#10B981'),
('VIP Customer', 'High value customers', '#F59E0B'),
('Abandoned Cart', 'Customers who abandoned their cart', '#EF4444'),
('Upsell Target', 'Customers eligible for upsells', '#8B5CF6'),
('Repeat Customer', 'Customers who made multiple purchases', '#06B6D4');

-- Create function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number ~ '^INV-\d+$';
  
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Add updated_at trigger for all new tables
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_tags_updated_at
  BEFORE UPDATE ON public.customer_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
