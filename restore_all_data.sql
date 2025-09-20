-- COMPREHENSIVE DATA RESTORATION SCRIPT
-- This script restores all products, tags, email templates, and other essential data

-- ==============================================
-- 1. RESTORE PRODUCTS DATA
-- ==============================================

-- Clear existing products and restore the complete product catalog
DELETE FROM public.products;

-- Insert all products with complete information
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

-- ==============================================
-- 2. RESTORE ORDER BUMPS DATA
-- ==============================================

-- Clear existing order bumps and restore
DELETE FROM public.order_bumps;

-- Insert order bumps with complete information
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

-- ==============================================
-- 3. RESTORE CUSTOMER TAGS DATA
-- ==============================================

-- Clear existing customer tags and restore
DELETE FROM public.customer_tags;

-- Insert default customer tags
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

-- ==============================================
-- 4. RESTORE EMAIL TEMPLATES DATA
-- ==============================================

-- Clear existing email templates and restore
DELETE FROM public.email_templates;

-- Insert comprehensive email templates
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
ARRAY['CUSTOMER_NAME']),

('Product Recommendation', 'Recommended for you: {PRODUCT_NAME}',
'<h1>We think you''ll love this!</h1><p>Hi {CUSTOMER_NAME}, based on your interests, we recommend {PRODUCT_NAME}.</p><p>Description: {PRODUCT_DESCRIPTION}</p><p>Price: {PRODUCT_PRICE}</p>',
'custom',
ARRAY['CUSTOMER_NAME', 'PRODUCT_NAME', 'PRODUCT_DESCRIPTION', 'PRODUCT_PRICE']);

-- ==============================================
-- 5. RESTORE EMAIL CAMPAIGNS DATA
-- ==============================================

-- Clear existing email campaigns and restore
DELETE FROM public.email_campaigns;

-- Insert default email campaigns
INSERT INTO public.email_campaigns (name, description, template_id, trigger_type, trigger_conditions, send_delay_minutes, is_active) 
SELECT 
'Welcome New Customers',
'Automated welcome email for new customers',
et.id,
'purchase',
'{"min_order_value": 0}',
0,
true
FROM public.email_templates et WHERE et.name = 'Welcome Email'

UNION ALL

SELECT 
'Abandoned Cart Recovery',
'Recover abandoned shopping carts',
et.id,
'abandoned_cart',
'{"delay_hours": 24}',
1440,
true
FROM public.email_templates et WHERE et.name = 'Abandoned Cart Reminder'

UNION ALL

SELECT 
'Google Review Request',
'Request reviews from satisfied customers',
et.id,
'purchase',
'{"delay_days": 30}',
43200,
true
FROM public.email_templates et WHERE et.name = 'Google Review Request';

-- ==============================================
-- 6. RESTORE SHIPPING SETTINGS
-- ==============================================

-- Clear and restore shipping settings
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

-- ==============================================
-- 7. RESTORE UPSELL PRODUCTS
-- ==============================================

-- Clear and restore upsell products
DELETE FROM public.upsell_products;

INSERT INTO public.upsell_products (name, description, type, price, duration_months, is_active) VALUES
('Extended Support Package', 'Get 6 months of extended support and consultation', 'support', 25000, 6, true),
('Premium Wellness Bundle', 'Complete wellness package with premium products', 'bundle', 50000, 3, true),
('VIP Membership', 'Exclusive VIP membership with special benefits', 'membership', 100000, 12, true);

-- ==============================================
-- 8. RESTORE DISCOUNT CODES
-- ==============================================

-- Clear and restore discount codes
DELETE FROM public.discount_codes;

INSERT INTO public.discount_codes (code, type, value, minimum_amount, usage_limit, is_active, expires_at) VALUES
('WELCOME10', 'percentage', 10, 10000, 100, true, NOW() + INTERVAL '30 days'),
('SAVE5000', 'fixed', 5000, 20000, 50, true, NOW() + INTERVAL '15 days'),
('VIP20', 'percentage', 20, 50000, 25, true, NOW() + INTERVAL '60 days');

-- ==============================================
-- 9. RESTORE AUTOMATION RULES
-- ==============================================

-- Clear and restore automation rules
DELETE FROM public.automation_rules;

INSERT INTO public.automation_rules (name, trigger, action, trigger_data, action_data, is_active) VALUES
('Google Review Request - 1 Month After Purchase', 'order_completed', 'send_email', '{"delay_days": 30}', '{"template_name": "Google Review Request"}', true),
('Welcome New Customer', 'order_completed', 'send_email', '{"delay_minutes": 0}', '{"template_name": "Welcome Email"}', true),
('Abandoned Cart Recovery', 'cart_abandoned', 'send_email', '{"delay_hours": 24}', '{"template_name": "Abandoned Cart Reminder"}', true);

-- ==============================================
-- 10. FINAL VERIFICATION AND CLEANUP
-- ==============================================

-- Update timestamps
UPDATE public.products SET updated_at = NOW();
UPDATE public.customer_tags SET updated_at = NOW();
UPDATE public.email_templates SET updated_at = NOW();
UPDATE public.email_campaigns SET updated_at = NOW();

-- Display restoration summary
DO $$
DECLARE
    product_count INTEGER;
    tag_count INTEGER;
    template_count INTEGER;
    campaign_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO tag_count FROM public.customer_tags;
    SELECT COUNT(*) INTO template_count FROM public.email_templates;
    SELECT COUNT(*) INTO campaign_count FROM public.email_campaigns;
    
    RAISE NOTICE 'DATA RESTORATION COMPLETE!';
    RAISE NOTICE 'Products restored: %', product_count;
    RAISE NOTICE 'Customer tags restored: %', tag_count;
    RAISE NOTICE 'Email templates restored: %', template_count;
    RAISE NOTICE 'Email campaigns restored: %', campaign_count;
    RAISE NOTICE 'All essential data has been successfully restored!';
END $$;

