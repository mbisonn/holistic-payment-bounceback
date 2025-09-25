-- Reputation Management and WhatsApp Integration Schema

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  rating int not null check (rating between 1 and 5),
  title text not null,
  content text not null,
  source text not null check (source in ('google','facebook','website','manual')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','flagged')),
  response text,
  response_date timestamptz,
  verified boolean not null default false,
  helpful_votes int not null default 0,
  reported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- WhatsApp configuration
create table if not exists public.whatsapp_config (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  phone_number text not null,
  api_token text not null,
  webhook_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- WhatsApp templates
create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null,
  category text not null check (category in ('purchase_notification','order_update','marketing','support')),
  variables text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- WhatsApp messages log
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null,
  customer_name text not null,
  template_id uuid references public.whatsapp_templates(id) on delete set null,
  content text not null,
  status text not null default 'pending' check (status in ('pending','sent','delivered','read','failed')),
  sent_at timestamptz not null default now(),
  delivered_at timestamptz,
  read_at timestamptz,
  error_message text
);

create index if not exists whatsapp_messages_sent_at_idx on public.whatsapp_messages (sent_at desc);

-- RLS policies (adjust as per your app's auth model)
alter table public.reviews enable row level security;
alter table public.whatsapp_config enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_messages enable row level security;

do $$ begin
  -- allow service role full access; app policies to be refined separately
  if not exists (select 1 from pg_policies where tablename = 'reviews' and policyname = 'allow all for authenticated') then
    create policy "allow all for authenticated" on public.reviews for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'whatsapp_config' and policyname = 'allow all for authenticated') then
    create policy "allow all for authenticated" on public.whatsapp_config for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'whatsapp_templates' and policyname = 'allow all for authenticated') then
    create policy "allow all for authenticated" on public.whatsapp_templates for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'whatsapp_messages' and policyname = 'allow all for authenticated') then
    create policy "allow all for authenticated" on public.whatsapp_messages for all to authenticated using (true) with check (true);
  end if;
end $$;



