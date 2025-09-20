-- Email events table for analytics
create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  message_id text not null,
  event_type text not null check (event_type in ('open', 'click')),
  url text,
  timestamp timestamptz not null default now(),
  recipient text,
  campaign_id text
);

create index if not exists idx_email_events_message_id on email_events(message_id);
create index if not exists idx_email_events_event_type on email_events(event_type);
create index if not exists idx_email_events_campaign_id on email_events(campaign_id); 