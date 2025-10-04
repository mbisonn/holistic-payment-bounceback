-- Remove the 'type' column from upsell_products if it exists
-- and ensure the table has the correct structure
DO $$ 
BEGIN
    -- Check if type column exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'upsell_products' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE upsell_products DROP COLUMN type;
    END IF;
END $$;

-- Ensure order_items table exists and is properly structured
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_items
DROP POLICY IF EXISTS order_items_consolidated_select ON order_items;
CREATE POLICY order_items_consolidated_select ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

DROP POLICY IF EXISTS order_items_consolidated_insert ON order_items;
CREATE POLICY order_items_consolidated_insert ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

DROP POLICY IF EXISTS order_items_consolidated_update ON order_items;
CREATE POLICY order_items_consolidated_update ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

DROP POLICY IF EXISTS order_items_consolidated_delete ON order_items;
CREATE POLICY order_items_consolidated_delete ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );