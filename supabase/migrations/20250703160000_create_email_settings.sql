-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id BIGSERIAL PRIMARY KEY,
  sender_email TEXT NOT NULL,
  admin_recipients TEXT[] NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO email_settings (sender_email, admin_recipients)
VALUES (
  'info@bouncebacktolifeconsult.pro',
  ARRAY['info@bouncebacktolifeconsult.pro', 'pecjos2017@gmail.com', 'sundaycollinsimoh@gmail.com']
)
ON CONFLICT DO NOTHING; 