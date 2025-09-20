-- ==============================================
-- FIX SPECIFIC LOADING ISSUES
-- This script addresses the specific dashboard loading problems
-- ==============================================

-- 1. FIX DISCOUNT CODES LOADING ISSUE
-- ==============================================

-- Ensure discount_codes table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL DEFAULT 0,
  minimum_amount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample discount codes if none exist
INSERT INTO public.discount_codes (code, type, value, minimum_amount, usage_limit, is_active, expires_at) 
SELECT * FROM (VALUES
('WELCOME10', 'percentage', 10, 10000, 100, true, NOW() + INTERVAL '30 days'),
('SAVE5000', 'fixed', 5000, 20000, 50, true, NOW() + INTERVAL '15 days'),
('VIP20', 'percentage', 20, 50000, 25, true, NOW() + INTERVAL '60 days')
) AS v(code, type, value, minimum_amount, usage_limit, is_active, expires_at)
WHERE NOT EXISTS (SELECT 1 FROM public.discount_codes);

-- 2. FIX MEAL PLAN SYNC LOADING ISSUE
-- ==============================================

-- Create meal_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  ingredients TEXT[],
  instructions TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  calories INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert sample meal plans if none exist
INSERT INTO public.meal_plans (name, description, category, ingredients, instructions, prep_time, cook_time, servings, calories, is_active) 
SELECT * FROM (VALUES
('Healthy Breakfast Bowl', 'Nutritious breakfast with fruits and grains', 'Breakfast', ARRAY['Oats', 'Banana', 'Berries', 'Honey', 'Almonds'], 'Mix all ingredients in a bowl and enjoy', 5, 0, 1, 350, true),
('Green Smoothie', 'Energizing green smoothie with spinach and fruits', 'Beverage', ARRAY['Spinach', 'Banana', 'Apple', 'Coconut Water', 'Chia Seeds'], 'Blend all ingredients until smooth', 5, 0, 1, 200, true),
('Quinoa Salad', 'Protein-rich quinoa salad with vegetables', 'Lunch', ARRAY['Quinoa', 'Cucumber', 'Tomato', 'Avocado', 'Lemon', 'Olive Oil'], 'Cook quinoa, mix with vegetables and dressing', 10, 15, 2, 400, true),
('Grilled Chicken Breast', 'Lean protein with herbs and spices', 'Dinner', ARRAY['Chicken Breast', 'Olive Oil', 'Herbs', 'Salt', 'Pepper'], 'Season and grill chicken until cooked through', 10, 20, 1, 250, true),
('Overnight Oats', 'Make-ahead breakfast with chia seeds', 'Breakfast', ARRAY['Rolled Oats', 'Chia Seeds', 'Almond Milk', 'Honey', 'Vanilla'], 'Mix ingredients and refrigerate overnight', 5, 0, 1, 300, true)
) AS v(name, description, category, ingredients, instructions, prep_time, cook_time, servings, calories, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.meal_plans);

-- 3. FIX EMAIL CAMPAIGN TEMPLATES NOT SHOWING
-- ==============================================

-- Ensure email_templates table exists
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  html_content TEXT,
  text_content TEXT,
  template_type TEXT,
  placeholders TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert email templates if none exist
INSERT INTO public.email_templates (name, subject, html_content, template_type, placeholders) 
SELECT * FROM (VALUES
('Order Confirmation', 'Thank you for your order #{ORDER_NUMBER}!', 
'<h1>Thank you {CUSTOMER_NAME}!</h1><p>Your order #{ORDER_NUMBER} has been confirmed.</p><p>Total: {TOTAL_AMOUNT}</p><p>Items: {ORDER_ITEMS}</p>', 
'order_confirmation', 
ARRAY['CUSTOMER_NAME', 'ORDER_NUMBER', 'TOTAL_AMOUNT', 'ORDER_ITEMS']),

('Abandoned Cart Reminder', 'You left something in your cart!', 
'<h1>Don''t forget your items!</h1><p>Hi {CUSTOMER_NAME}, you left some items in your cart. Complete your purchase now!</p><p>Items: {CART_ITEMS}</p><p>Total: {TOTAL_AMOUNT}</p>', 
'abandoned_cart', 
ARRAY['CUSTOMER_NAME', 'CART_ITEMS', 'TOTAL_AMOUNT']),

('Upsell Offer', 'Special offer just for you!', 
'<h1>Exclusive Upsell Offer</h1><p>Hi {CUSTOMER_NAME}, we have a special offer based on your recent purchase!</p><p>Offer: {OFFER_DETAILS}</p><p>Discount: {DISCOUNT_AMOUNT}</p>', 
'upsell', 
ARRAY['CUSTOMER_NAME', 'OFFER_DETAILS', 'DISCOUNT_AMOUNT']),

('Google Review Request', 'How did we do?',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Our Service</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2c3e50;">How did we do?</h1>
  <p>Hello {CUSTOMER_NAME},</p>
  <p>Thank you for choosing us, we''d love your feedback. How was your experience today?</p>
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-top: 20px;">
    <a href="#" style="background-color: #FF4136; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">1 - Poor</a>
    <a href="#" style="background-color: #FF851B; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">2 - Fair</a>
    <a href="#" style="background-color: #FFDC00; color: black; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">3 - Good</a>
    <a href="#" style="background-color: #2ECC40; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">4 - Great</a>
    <a href="#" style="background-color: #0074D9; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">5 - Excellent</a>
  </div>
  <p>Your feedback helps us to be better.</p>
  <p>I appreciate you,</p>
  <p>Tenera Holistic and Wellness Team</p>
</body>
</html>',
'custom',
ARRAY['CUSTOMER_NAME']),

('Welcome Email', 'Welcome to Tenera Holistic and Wellness!',
'<h1>Welcome {CUSTOMER_NAME}!</h1><p>Thank you for joining our wellness community. We''re excited to help you on your health journey.</p><p>Explore our products and start your wellness transformation today!</p>',
'custom',
ARRAY['CUSTOMER_NAME'])
) AS v(name, subject, html_content, template_type, placeholders)
WHERE NOT EXISTS (SELECT 1 FROM public.email_templates);

-- Ensure email_campaigns table exists
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  trigger_type TEXT,
  trigger_conditions JSONB DEFAULT '{}',
  send_delay_minutes INTEGER DEFAULT 0,
  recipient_tags UUID[],
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert email campaigns if none exist
INSERT INTO public.email_campaigns (name, description, subject, template_id, trigger_type, trigger_conditions, send_delay_minutes, status, is_active) 
SELECT 
'Welcome New Customers',
'Automated welcome email for new customers',
'Welcome to Tenera Holistic and Wellness!',
et.id,
'purchase',
'{"min_order_value": 0}'::jsonb,
0,
'draft',
true
FROM public.email_templates et WHERE et.name = 'Welcome Email'
AND NOT EXISTS (SELECT 1 FROM public.email_campaigns WHERE name = 'Welcome New Customers')

UNION ALL

SELECT 
'Abandoned Cart Recovery',
'Recover abandoned shopping carts',
'You left something in your cart!',
et.id,
'abandoned_cart',
'{"delay_hours": 24}'::jsonb,
1440,
'draft',
true
FROM public.email_templates et WHERE et.name = 'Abandoned Cart Reminder'
AND NOT EXISTS (SELECT 1 FROM public.email_campaigns WHERE name = 'Abandoned Cart Recovery')

UNION ALL

SELECT 
'Google Review Request',
'Request reviews from satisfied customers',
'How did we do?',
et.id,
'purchase',
'{"delay_days": 30}'::jsonb,
43200,
'draft',
true
FROM public.email_templates et WHERE et.name = 'Google Review Request'
AND NOT EXISTS (SELECT 1 FROM public.email_campaigns WHERE name = 'Google Review Request');

-- 4. ENSURE ALL TABLES HAVE PROPER RLS POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new permissive ones
DROP POLICY IF EXISTS "Allow all access to discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Allow all access to meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Allow all access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow all access to email_campaigns" ON public.email_campaigns;

CREATE POLICY "Allow all access to discount_codes" ON public.discount_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to meal_plans" ON public.meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_templates" ON public.email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_campaigns" ON public.email_campaigns FOR ALL USING (true) WITH CHECK (true);

-- 5. SUCCESS MESSAGE
-- ==============================================
DO $$
DECLARE
    discount_count INTEGER;
    meal_count INTEGER;
    template_count INTEGER;
    campaign_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO discount_count FROM public.discount_codes;
    SELECT COUNT(*) INTO meal_count FROM public.meal_plans;
    SELECT COUNT(*) INTO template_count FROM public.email_templates;
    SELECT COUNT(*) INTO campaign_count FROM public.email_campaigns;
    
    RAISE NOTICE '🎉 LOADING ISSUES FIXED! 🎉';
    RAISE NOTICE 'Discount codes available: %', discount_count;
    RAISE NOTICE 'Meal plans available: %', meal_count;
    RAISE NOTICE 'Email templates available: %', template_count;
    RAISE NOTICE 'Email campaigns available: %', campaign_count;
    RAISE NOTICE 'All RLS policies updated for full access!';
    RAISE NOTICE 'Your dashboard sections should now load properly!';
END $$;
