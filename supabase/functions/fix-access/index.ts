import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Execute the comprehensive access fix
    const { data, error } = await supabaseClient.rpc('exec_sql', {
      sql: `
        -- Drop all existing restrictive RLS policies
        DROP POLICY IF EXISTS "Users can view own data" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admin access to profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admin access to products" ON public.products;
        DROP POLICY IF EXISTS "Public can view active products" ON public.products;
        DROP POLICY IF EXISTS "Admin access to orders" ON public.orders;
        DROP POLICY IF EXISTS "Admin access to order_bumps" ON public.order_bumps;
        DROP POLICY IF EXISTS "Admin access to upsell_products" ON public.upsell_products;
        DROP POLICY IF EXISTS "Admin access to discount_codes" ON public.discount_codes;
        DROP POLICY IF EXISTS "Admin access to customer_analytics" ON public.customer_analytics;
        DROP POLICY IF EXISTS "Admin access to email_templates" ON public.email_templates;
        DROP POLICY IF EXISTS "Admin access to email_campaigns" ON public.email_campaigns;
        DROP POLICY IF EXISTS "Admin access to automation_workflows" ON public.automation_workflows;
        DROP POLICY IF EXISTS "Admin access to automation_triggers" ON public.automation_triggers;
        DROP POLICY IF EXISTS "Admin access to automation_actions" ON public.automation_actions;
        DROP POLICY IF EXISTS "Admin access to automation_logs" ON public.automation_logs;
        DROP POLICY IF EXISTS "Admin access to tags" ON public.tags;
        DROP POLICY IF EXISTS "Admin access to customer_tags" ON public.customer_tags;
        DROP POLICY IF EXISTS "Admin access to shipping_settings" ON public.shipping_settings;
        DROP POLICY IF EXISTS "Admin access to meal_plan_sync" ON public.meal_plan_sync;
        DROP POLICY IF EXISTS "Admin access to user_access_requests" ON public.user_access_requests;
        DROP POLICY IF EXISTS "Admin access to user_roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admin access to scheduled_emails" ON public.scheduled_emails;
        DROP POLICY IF EXISTS "Admin access to email_tracking" ON public.email_tracking;

        -- Create permissive policies for all authenticated users
        CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage orders" ON public.orders FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage order_bumps" ON public.order_bumps FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage upsell_products" ON public.upsell_products FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage discount_codes" ON public.discount_codes FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage customer_analytics" ON public.customer_analytics FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage email_templates" ON public.email_templates FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage email_campaigns" ON public.email_campaigns FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage automation_workflows" ON public.automation_workflows FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage automation_triggers" ON public.automation_triggers FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage automation_actions" ON public.automation_actions FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage automation_logs" ON public.automation_logs FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage tags" ON public.tags FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage customer_tags" ON public.customer_tags FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage shipping_settings" ON public.shipping_settings FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage meal_plan_sync" ON public.meal_plan_sync FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage user_access_requests" ON public.user_access_requests FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage user_roles" ON public.user_roles FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage scheduled_emails" ON public.scheduled_emails FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Authenticated users can manage email_tracking" ON public.email_tracking FOR ALL USING (auth.uid() IS NOT NULL);

        -- Grant permissions
        GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
      `
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Access policies updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
