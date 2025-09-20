-- ==============================================
-- COMPREHENSIVE DASHBOARD FIX SCRIPT
-- This script fixes all dashboard loading and data issues
-- ==============================================

-- 1. CREATE MISSING TABLES AND RESTORE ALL DATA
-- ==============================================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to products
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
END $$;

-- Restore all products
DELETE FROM public.products;
INSERT INTO public.products (name, description, price, image_url, category, is_active, stock_quantity) VALUES
('Faforon', 'Premium herbal supplement for overall wellness', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70fdeb16d_52.png', 'Supplements', true, 100),
('Becool', 'Natural cooling supplement for body temperature regulation', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8aea50919_43.png', 'Supplements', true, 100),
('Dynace Rocenta', 'Advanced wellness formula for enhanced vitality', 30000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b708190650_42.png', 'Premium', true, 50),
('Spidex 12', 'Specialized health supplement for immune support', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7105cd6d2_62.png', 'Supplements', true, 100),
('Salud', 'Complete health formula for daily wellness', 20000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b711b93315_82.png', 'Supplements', true, 100),
('Jigsimur', 'Traditional herbal blend for digestive health', 17500, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8afde7c99_63.png', 'Supplements', true, 100),
('Jinja', 'Energy boosting herbal supplement', 17000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70301077f_32.png', 'Supplements', true, 100),
('Faforditoz', 'Enhanced formula for optimal health', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8af681d36_53.png', 'Supplements', true, 100),
('Spidex 17', 'Advanced immune system support', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71440b18d_121.png', 'Supplements', true, 100),
('Spidex 20', 'Premium wellness supplement', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b65dfab8a5_12.png', 'Supplements', true, 100),
('Spidex 18', 'Comprehensive health support formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71529fe6c_131.png', 'Supplements', true, 100),
('Men Coffee', 'Specially formulated coffee for men''s health', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b18acad0_83.png', 'Beverages', true, 100),
('Spidex 21', 'Complete wellness solution', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7135da5ca_101.png', 'Supplements', true, 100),
('Spidex 19', 'Advanced health maintenance formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b710f8a766_72.png', 'Supplements', true, 100),
('Spidex 15', 'Essential health supplement', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b66c75de26_22.png', 'Supplements', true, 100),
('Prosclick', 'Professional strength wellness formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b712643cd7_91.png', 'Supplements', true, 100),
('Green Coffee', 'Natural green coffee for weight management', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b27469be_92.png', 'Beverages', true, 100),
('Iru Antiseptic Soap', 'Natural antiseptic soap for skin care', 15000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b09633de_73.png', 'Personal Care', true, 100),
('Multi Effect Toothpaste', 'Complete oral care toothpaste', 4500, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b338f624_102.png', 'Personal Care', true, 100);

-- Create customer_tags table
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Restore customer tags
DELETE FROM public.customer_tags;
INSERT INTO public.customer_tags (name, description, color) VALUES
('New Customer', 'First time buyers', '#10B981'),
('VIP Customer', 'High value customers', '#F59E0B'),
('Abandoned Cart', 'Customers who abandoned their cart', '#EF4444'),
('Upsell Target', 'Customers eligible for upsells', '#8B5CF6'),
('Repeat Customer', 'Customers who made multiple purchases', '#06B6D4'),
('Health Supplements', 'Customers interested in health supplements', '#3B82F6'),
('Premium Products', 'Customers who purchase premium products', '#7C3AED'),
('Coffee Lovers', 'Customers interested in coffee products', '#D97706'),
('Personal Care', 'Customers interested in personal care products', '#059669');

-- Create order_bumps table
CREATE TABLE IF NOT EXISTS public.order_bumps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  discounted_price NUMERIC,
  product_id TEXT,
  isactive BOOLEAN NOT NULL DEFAULT true,
  order_position INTEGER DEFAULT 0,
  conditions JSONB,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Restore order bumps
DELETE FROM public.order_bumps;
INSERT INTO public.order_bumps (id, title, description, price, product_id, isactive, conditions, image) VALUES
('bump-001', 
'Boost Your Immunity Alongside Your Stem Cell Support!', 
'Add our powerful Immune Defender Formula—packed with Vitamin C, Zinc, and Tumeric—to fortify your body''s natural defense system while your stem cell supplement does its job.\nProtect. Recover. Thrive.\n👉 Just ₦20,000 extra — one-time only!', 
20000, 
'immuno-guard-plus', 
true,
'{"requiredProducts": [], "excludeProducts": ["immuno-guard-plus"]}',
'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56bf61a00_14.png'),

('bump-002', 
'Cleanse Your System for Better Results with Liver Tea!', 
'Did you know toxins can block nutrient absorption? Support your liver and kidneys with our Gentle Herbal Detox Blend and allow your stem cell supplement to work more effectively.\nFeel lighter, cleaner, and more energized—naturally.\n👉 Add it now for only ₦20,000!', 
20000, 
'liver-tea', 
true,
'{"requiredProducts": [], "excludeProducts": ["liver-tea"]}',
'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e57a19604c_22.png'),

('bump-003', 
'Power Up Your Heart for Total Wellness!', 
'Did you know a strong heart is the foundation of lasting vitality? Support your cardiovascular system with Gentle Herbal Cardio Tincture—featuring Capsicum Annuum and Ginger—to amplify the benefits of your daily wellness routine.\n\nWhy Add Cardio Tincture?\n\nRegulates Blood Pressure: Promotes healthy circulation and balanced levels.\n\nStrengthens Heart Function: Enhances cardiovascular resilience naturally.\n\nReduces Stress & Boosts Energy: Combats inflammation and supports calm, steady energy.\n\nFeel stronger, more balanced, and ready to thrive—naturally.\n👉 Add it now for only ₦5,000!', 
5000, 
'cardio-tincture', 
true,
'{"requiredProducts": ["cardio-sure", "vein-thrombus"], "excludeProducts": ["cardio-tincture"]}',
'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e574fc28d2_18.png');

-- Create email_templates table
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

-- Restore email templates
DELETE FROM public.email_templates;
INSERT INTO public.email_templates (name, subject, html_content, template_type, placeholders) VALUES
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
ARRAY['CUSTOMER_NAME']);

-- Create email_campaigns table
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

-- Restore email campaigns
DELETE FROM public.email_campaigns;
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
FROM public.email_templates et WHERE et.name = 'Google Review Request';

-- Create discount_codes table
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

-- Restore discount codes
DELETE FROM public.discount_codes;
INSERT INTO public.discount_codes (code, type, value, minimum_amount, usage_limit, is_active, expires_at) VALUES
('WELCOME10', 'percentage', 10, 10000, 100, true, NOW() + INTERVAL '30 days'),
('SAVE5000', 'fixed', 5000, 20000, 50, true, NOW() + INTERVAL '15 days'),
('VIP20', 'percentage', 20, 50000, 25, true, NOW() + INTERVAL '60 days');

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  action_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Restore automation rules
DELETE FROM public.automation_rules;
INSERT INTO public.automation_rules (name, trigger, action, trigger_data, action_data, is_active) VALUES
('Google Review Request - 1 Month After Purchase', 'order_completed', 'send_email', '{"delay_days": 30}'::jsonb, '{"template_name": "Google Review Request"}'::jsonb, true),
('Welcome New Customer', 'order_completed', 'send_email', '{"delay_minutes": 0}'::jsonb, '{"template_name": "Welcome Email"}'::jsonb, true),
('Abandoned Cart Recovery', 'cart_abandoned', 'send_email', '{"delay_hours": 24}'::jsonb, '{"template_name": "Abandoned Cart Reminder"}'::jsonb, true);

-- Create meal_plans table for meal plan sync
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

-- Restore sample meal plans
DELETE FROM public.meal_plans;
INSERT INTO public.meal_plans (name, description, category, ingredients, instructions, prep_time, cook_time, servings, calories, is_active) VALUES
('Healthy Breakfast Bowl', 'Nutritious breakfast with fruits and grains', 'Breakfast', ARRAY['Oats', 'Banana', 'Berries', 'Honey', 'Almonds'], 'Mix all ingredients in a bowl and enjoy', 5, 0, 1, 350, true),
('Green Smoothie', 'Energizing green smoothie with spinach and fruits', 'Beverage', ARRAY['Spinach', 'Banana', 'Apple', 'Coconut Water', 'Chia Seeds'], 'Blend all ingredients until smooth', 5, 0, 1, 200, true),
('Quinoa Salad', 'Protein-rich quinoa salad with vegetables', 'Lunch', ARRAY['Quinoa', 'Cucumber', 'Tomato', 'Avocado', 'Lemon', 'Olive Oil'], 'Cook quinoa, mix with vegetables and dressing', 10, 15, 2, 400, true);

-- 2. CREATE USER CENTER TABLES AND POPULATE WITH SUPABASE USERS
-- ==============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create app_role enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');
    END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Populate profiles for all existing Supabase users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    'user'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

-- Assign admin role to ebuchenna1@gmail.com
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'ebuchenna1@gmail.com';

-- Insert user roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
    p.id,
    p.role::app_role
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role::text = p.role)
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. FIX ALL RLS POLICIES - GIVE EVERYONE ACCESS TO EVERYTHING
-- ==============================================

-- Drop all existing RLS policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables - EVERYONE CAN ACCESS EVERYTHING
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customer_tags" ON public.customer_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to order_bumps" ON public.order_bumps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_templates" ON public.email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_campaigns" ON public.email_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to discount_codes" ON public.discount_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to automation_rules" ON public.automation_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to meal_plans" ON public.meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

-- 4. CREATE HELPER FUNCTIONS
-- ==============================================

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = user_id 
        AND user_roles.role = 'admin'::app_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role::text FROM public.user_roles 
        WHERE user_roles.user_id = user_id 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SUCCESS MESSAGE
-- ==============================================
DO $$
DECLARE
    product_count INTEGER;
    tag_count INTEGER;
    template_count INTEGER;
    campaign_count INTEGER;
    discount_count INTEGER;
    automation_count INTEGER;
    meal_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO tag_count FROM public.customer_tags;
    SELECT COUNT(*) INTO template_count FROM public.email_templates;
    SELECT COUNT(*) INTO campaign_count FROM public.email_campaigns;
    SELECT COUNT(*) INTO discount_count FROM public.discount_codes;
    SELECT COUNT(*) INTO automation_count FROM public.automation_rules;
    SELECT COUNT(*) INTO meal_count FROM public.meal_plans;
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    RAISE NOTICE '🎉 DASHBOARD FIX COMPLETE! 🎉';
    RAISE NOTICE 'Products restored: %', product_count;
    RAISE NOTICE 'Customer tags restored: %', tag_count;
    RAISE NOTICE 'Email templates restored: %', template_count;
    RAISE NOTICE 'Email campaigns restored: %', campaign_count;
    RAISE NOTICE 'Discount codes restored: %', discount_count;
    RAISE NOTICE 'Automation rules restored: %', automation_count;
    RAISE NOTICE 'Meal plans restored: %', meal_count;
    RAISE NOTICE 'Users in system: %', user_count;
    RAISE NOTICE 'All RLS policies updated - everyone has access to everything!';
    RAISE NOTICE 'Your dashboard should now be fully functional!';
END $$;
