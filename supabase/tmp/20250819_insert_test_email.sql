-- Insert a test email into public.email_outbox
insert into public.email_outbox (
  recipient,
  subject,
  text_body,
  html_body,
  tries
) values (
  'info@bouncebacktolifeconsult.pro',
  'Test: Resend domain verified',
  'Plain text body from Supabase Edge Function test',
  '<p>Hello from <strong>Supabase Edge Functions</strong> via Resend!</p>',
  0
);

-- Optional: view queued items
select id, recipient, subject, tries, sent_at, last_error, created_at
from public.email_outbox
order by id desc
limit 5;
