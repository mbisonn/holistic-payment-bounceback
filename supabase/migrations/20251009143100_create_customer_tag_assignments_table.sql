-- Create customer_tag_assignments table for customer tagging
CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    tag_id UUID REFERENCES public.customer_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_email ON public.customer_tag_assignments(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON public.customer_tag_assignments(tag_id);

-- Create unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_tag_assignments_unique 
    ON public.customer_tag_assignments(customer_email, tag_id);

-- Enable Row Level Security
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all authenticated users" ON public.customer_tag_assignments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.customer_tag_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.customer_tag_assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.customer_tag_assignments
    FOR DELETE USING (auth.role() = 'authenticated');
