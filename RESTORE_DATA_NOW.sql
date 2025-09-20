-- ==============================================
-- IMMEDIATE DATA RESTORATION SCRIPT
-- Run this script directly in your Supabase SQL Editor
-- ==============================================

-- 1. RESTORE ALL PRODUCTS
-- First, let's check if image_url column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;
END $$;

DELETE FROM public.products;
INSERT INTO public.products (name, description, price, image_url, category, is_active) VALUES
('Faforon', 'Premium herbal supplement for overall wellness', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70fdeb16d_52.png', 'Supplements', true),
('Becool', 'Natural cooling supplement for body temperature regulation', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8aea50919_43.png', 'Supplements', true),
('Dynace Rocenta', 'Advanced wellness formula for enhanced vitality', 30000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b708190650_42.png', 'Premium', true),
('Spidex 12', 'Specialized health supplement for immune support', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7105cd6d2_62.png', 'Supplements', true),
('Salud', 'Complete health formula for daily wellness', 20000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b711b93315_82.png', 'Supplements', true),
('Jigsimur', 'Traditional herbal blend for digestive health', 17500, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8afde7c99_63.png', 'Supplements', true),
('Jinja', 'Energy boosting herbal supplement', 17000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70301077f_32.png', 'Supplements', true),
('Faforditoz', 'Enhanced formula for optimal health', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8af681d36_53.png', 'Supplements', true),
('Spidex 17', 'Advanced immune system support', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71440b18d_121.png', 'Supplements', true),
('Spidex 20', 'Premium wellness supplement', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b65dfab8a5_12.png', 'Supplements', true),
('Spidex 18', 'Comprehensive health support formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71529fe6c_131.png', 'Supplements', true),
('Men Coffee', 'Specially formulated coffee for men''s health', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b18acad0_83.png', 'Beverages', true),
('Spidex 21', 'Complete wellness solution', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7135da5ca_101.png', 'Supplements', true),
('Spidex 19', 'Advanced health maintenance formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b710f8a766_72.png', 'Supplements', true),
('Spidex 15', 'Essential health supplement', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b66c75de26_22.png', 'Supplements', true),
('Prosclick', 'Professional strength wellness formula', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b712643cd7_91.png', 'Supplements', true),
('Green Coffee', 'Natural green coffee for weight management', 14000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b27469be_92.png', 'Beverages', true),
('Iru Antiseptic Soap', 'Natural antiseptic soap for skin care', 15000, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b09633de_73.png', 'Personal Care', true),
('Multi Effect Toothpaste', 'Complete oral care toothpaste', 4500, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b338f624_102.png', 'Personal Care', true);

-- 2. RESTORE CUSTOMER TAGS
-- Create customer_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 3. RESTORE EMAIL TEMPLATES
-- Create email_templates table if it doesn't exist
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

-- First, let's check if email_templates table has the required columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_templates' AND column_name = 'html_content'
    ) THEN
        ALTER TABLE public.email_templates ADD COLUMN html_content TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_templates' AND column_name = 'template_type'
    ) THEN
        ALTER TABLE public.email_templates ADD COLUMN template_type TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_templates' AND column_name = 'placeholders'
    ) THEN
        ALTER TABLE public.email_templates ADD COLUMN placeholders TEXT[];
    END IF;
END $$;

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

-- 4. RESTORE ORDER BUMPS
-- Create order_bumps table if it doesn't exist
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

-- First, let's check if order_bumps table has the required columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_bumps' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE public.order_bumps ADD COLUMN product_id TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_bumps' AND column_name = 'conditions'
    ) THEN
        ALTER TABLE public.order_bumps ADD COLUMN conditions JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_bumps' AND column_name = 'image'
    ) THEN
        ALTER TABLE public.order_bumps ADD COLUMN image TEXT;
    END IF;
END $$;

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

-- 5. RESTORE SHIPPING SETTINGS
-- Create shipping_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_fee NUMERIC DEFAULT 0,
  lagos_delivery_fee NUMERIC DEFAULT 0,
  other_states_delivery_fee NUMERIC DEFAULT 0,
  free_shipping_threshold NUMERIC DEFAULT 0,
  enable_free_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DELETE FROM public.shipping_settings;
INSERT INTO public.shipping_settings (
  name, 
  description, 
  base_fee, 
  lagos_delivery_fee, 
  other_states_delivery_fee, 
  free_shipping_threshold, 
  enable_free_shipping,
  is_active
) VALUES (
  'Default Shipping', 
  'Default shipping configuration', 
  2500, 
  2000, 
  5000, 
  50000, 
  true,
  true
);

-- 6. RESTORE DISCOUNT CODES
-- Create discount_codes table if it doesn't exist
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

DELETE FROM public.discount_codes;
INSERT INTO public.discount_codes (code, type, value, minimum_amount, usage_limit, is_active, expires_at) VALUES
('WELCOME10', 'percentage', 10, 10000, 100, true, NOW() + INTERVAL '30 days'),
('SAVE5000', 'fixed', 5000, 20000, 50, true, NOW() + INTERVAL '15 days'),
('VIP20', 'percentage', 20, 50000, 25, true, NOW() + INTERVAL '60 days');

-- SUCCESS MESSAGE
SELECT 'DATA RESTORATION COMPLETE! All products, tags, email templates, order bumps, shipping settings, and discount codes have been restored successfully!' as status;
