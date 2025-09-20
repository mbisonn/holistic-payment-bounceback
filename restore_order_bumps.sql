-- RESTORE ORDER BUMPS DATA
-- This script restores order bumps data and ensures the table structure is correct

-- Drop and recreate the table to ensure proper UUID generation
DROP TABLE IF EXISTS public.order_bumps CASCADE;

-- Create the order_bumps table with proper structure
CREATE TABLE public.order_bumps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    original_price decimal(10,2) NOT NULL,
    discounted_price decimal(10,2),
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

-- Create optimized RLS policy
DROP POLICY IF EXISTS "authenticated_access_order_bumps" ON public.order_bumps;
CREATE POLICY "authenticated_access_order_bumps" ON public.order_bumps
FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Insert sample order bumps data (prices in Nigerian Naira)
INSERT INTO public.order_bumps (title, description, original_price, discounted_price, image_url, is_active) VALUES
('Premium Meal Prep Container Set', 'High-quality glass containers perfect for meal prep storage', 65000, 45000, '/images/containers.jpg', true),
('Nutrition Guide eBook', 'Comprehensive nutrition guide with meal planning tips', 48000, 32000, '/images/ebook.jpg', true),
('Protein Powder Supplement', 'Premium whey protein powder for post-workout recovery', 115000, 85000, '/images/protein.jpg', true),
('Meal Planning Template Pack', 'Digital templates to help you plan your weekly meals', 40000, 25000, '/images/templates.jpg', true),
('Kitchen Scale Digital', 'Precise digital scale for accurate portion control', 58000, 42000, '/images/scale.jpg', true),
('Healthy Snack Box', 'Curated box of healthy snacks for on-the-go nutrition', 75000, 58000, '/images/snackbox.jpg', true),
('Recipe Collection Bundle', 'Over 100 healthy recipes for every meal', 98000, 68000, '/images/recipes.jpg', true),
('Fitness Tracker Band', 'Track your daily activity and health metrics', 165000, 125000, '/images/tracker.jpg', true);

-- Grant permissions
GRANT ALL ON public.order_bumps TO authenticated;

-- Verify data was inserted
SELECT 
    'ORDER BUMPS RESTORED' as status,
    count(*) as total_order_bumps
FROM public.order_bumps;
