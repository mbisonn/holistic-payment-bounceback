-- First, add unique constraint to products table for name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_name_unique'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_name_unique UNIQUE (name);
  END IF;
END$$;

-- Then insert or update products with hardcoded product data
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
('Multi Effect Toothpaste', 'Complete oral care toothpaste', 4500, 'https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b338f624_102.png', 'Personal Care', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;