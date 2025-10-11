import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Settings } from 'lucide-react';

interface WhatsAppSettings {
  api_provider: 'twilio' | 'whatsapp_business_api';
  api_key: string;
  api_secret?: string;
  phone_number: string;
  phone_number_id?: string;
  webhook_verify_token?: string;
  is_active: boolean;
}

export default function WhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    api_provider: 'twilio',
    api_key: '',
    api_secret: '',
    phone_number: '',
    phone_number_id: '',
    webhook_verify_token: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(data as WhatsAppSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert(settings);

      if (error) throw error;
      toast.success('WhatsApp settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-glass-text">
          <Settings className="h-5 w-5" />
          WhatsApp Configuration
        </CardTitle>
        <CardDescription className="text-glass-text-secondary">
          Configure your WhatsApp Business API settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-glass-text">API Provider</Label>
          <Select
            value={settings.api_provider}
            onValueChange={(value: any) => setSettings(prev => ({ ...prev, api_provider: value }))}
          >
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="whatsapp_business_api">WhatsApp Business API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-glass-text">API Key / Account SID</Label>
          <Input
            value={settings.api_key}
            onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
            className="glass-input"
          />
        </div>

        {settings.api_provider === 'twilio' && (
          <div>
            <Label className="text-glass-text">Auth Token</Label>
            <Input
              type="password"
              value={settings.api_secret || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, api_secret: e.target.value }))}
              className="glass-input"
            />
          </div>
        )}

        <div>
          <Label className="text-glass-text">Phone Number</Label>
          <Input
            value={settings.phone_number}
            onChange={(e) => setSettings(prev => ({ ...prev, phone_number: e.target.value }))}
            placeholder="+1234567890"
            className="glass-input"
          />
        </div>

        {settings.api_provider === 'whatsapp_business_api' && (
          <div>
            <Label className="text-glass-text">Phone Number ID</Label>
            <Input
              value={settings.phone_number_id || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, phone_number_id: e.target.value }))}
              className="glass-input"
            />
          </div>
        )}

        <div>
          <Label className="text-glass-text">Webhook Verify Token</Label>
          <Input
            value={settings.webhook_verify_token || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, webhook_verify_token: e.target.value }))}
            className="glass-input"
          />
        </div>

        <Button onClick={saveSettings} disabled={saving} className="w-full glass-button">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
