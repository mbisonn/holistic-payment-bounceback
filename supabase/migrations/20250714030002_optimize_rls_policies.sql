
-- Optimize RLS policies to prevent auth function re-evaluation for better performance

-- Customer tag assignments - consolidate and optimize
DROP POLICY IF EXISTS "Customer tag assignments are viewable by admins" ON public.customer_tag_assignments;
DROP POLICY IF EXISTS "View customer tag assignments for admins" ON public.customer_tag_assignments;
DROP POLICY IF EXISTS "Admins can manage customer tag assignments" ON public.customer_tag_assignments;

CREATE POLICY "Admins can manage customer tag assignments" ON public.customer_tag_assignments
FOR ALL USING (
  has_role((SELECT auth.uid()), 'admin')
);

-- Customer tags - consolidate and optimize
DROP POLICY IF EXISTS "Admins can manage customer tags" ON public.customer_tags;
DROP POLICY IF EXISTS "Customer tags are viewable by admins" ON public.customer_tags;

CREATE POLICY "Admins can manage customer tags" ON public.customer_tags
FOR ALL USING (
  has_role((SELECT auth.uid()), 'admin')
);

-- Email campaigns - consolidate and optimize
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Email campaigns are viewable by admins" ON public.email_campaigns;

CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
FOR ALL USING (
  has_role((SELECT auth.uid()), 'admin')
);

-- Email logs - consolidate and optimize
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can insert email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can update email logs" ON public.email_logs;

CREATE POLICY "Admins can manage email logs" ON public.email_logs
FOR ALL USING (
  has_role((SELECT auth.uid()), 'admin')
)
WITH CHECK (
  has_role((SELECT auth.uid()), 'admin')
);

-- Email templates - consolidate and optimize
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Email templates are viewable by admins" ON public.email_templates;

CREATE POLICY "Admins can manage email templates" ON public.email_templates
FOR ALL USING (
  has_role((SELECT auth.uid()), 'admin')
);
