import { supabase } from '@/integrations/supabase/client';

export interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface GmailStatus {
  status: 'connected' | 'disconnected';
  email: string | null;
}

export const syncGmailWithEmailSettings = async (
  gmailStatus: GmailStatus,
  setEmailSettings: (settings: EmailSettings) => void
) => {
  if (gmailStatus.status === 'connected' && gmailStatus.email) {
    // Update email settings to match Gmail connection
    const updatedSettings: EmailSettings = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: gmailStatus.email,
      smtpPassword: '', // Password should be set separately for security
      fromEmail: gmailStatus.email,
      fromName: 'Your Store Name'
    };
    
    setEmailSettings(updatedSettings);
    
    // Save to database
    try {
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          name: 'Email Settings',
          trigger: 'system',
          action: 'email_config',
          trigger_data: JSON.stringify(updatedSettings),
          is_active: true
        });

      if (error) {
        console.error('Failed to sync Gmail settings:', error);
      }
    } catch (error) {
      console.error('Error syncing Gmail settings:', error);
    }
  } else {
    // Clear email settings when Gmail is disconnected
    const clearedSettings: EmailSettings = {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: ''
    };
    
    setEmailSettings(clearedSettings);
  }
};

export const loadEmailSettingsFromDatabase = async (): Promise<EmailSettings> => {
  try {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('trigger_data')
      .eq('name', 'Email Settings')
      .eq('trigger', 'system')
      .eq('action', 'email_config')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return JSON.parse(String(data.trigger_data || '{}'));
    }
  } catch (error) {
    console.error('Error loading email settings:', error);
  }

  // Return default settings
  return {
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: ''
  };
};
