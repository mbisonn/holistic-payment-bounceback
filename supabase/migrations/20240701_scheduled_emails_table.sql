-- Create scheduled_emails table for delayed email sending
create table if not exists scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  html text not null,
  campaign_id uuid, -- Foreign key constraint will be added later when email_campaigns table exists
  customer_email text,
  send_at timestamptz not null,
  sent_at timestamptz,
  status text default 'pending',
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists scheduled_emails_send_at_idx on scheduled_emails (send_at, status);