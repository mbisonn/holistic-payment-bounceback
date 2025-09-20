
CREATE TABLE IF NOT EXISTS upsell_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR CHECK (type IN ('upsell', 'downsell')) NOT NULL,
  price INTEGER NOT NULL,
  duration_months INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert the initial upsell/downsell products
INSERT INTO upsell_products (name, description, type, price, duration_months) VALUES
('Tenera Tribe - Annual Membership', 'Full access to Tenera Tribe for one year', 'upsell', 50000, 12),
('Tenera Tribe (Lite) - 3 Month Access', 'Limited access to Tenera Tribe for three months', 'downsell', 15000, 3);
