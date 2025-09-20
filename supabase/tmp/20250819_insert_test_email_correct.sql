-- Corrected test insert for public.email_outbox matching sender function schema
-- Columns expected by function: id, to_email, to_name, subject, body_html, attachment_path, status, tries, last_error, sent_at, created_at

insert into public.email_outbox (
  to_email,
  to_name,
  subject,
  body_html,
  attachment_path,
  status,
  tries
) values (
  'info@bouncebacktolifeconsult.pro',
  'Info',
  'Test: Resend domain verified',
  '<p>Hello from <strong>Supabase Edge Functions</strong> via Resend!</p>',
  null,
  'queued',
  0
);

-- Inspect queue state
select id, to_email, subject, status, tries, sent_at, last_error, created_at
from public.email_outbox
order by created_at desc
limit 10;
