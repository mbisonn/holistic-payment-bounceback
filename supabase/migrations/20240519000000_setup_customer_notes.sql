-- Create customer_notes table for CRM notes/tags
CREATE TABLE IF NOT EXISTS customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text UNIQUE NOT NULL,
  notes text,
  tags text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_email ON customer_notes (customer_email); 