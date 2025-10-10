import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, TestTube, Loader2 } from 'lucide-react';

export const WhatsAppSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    api_provider: 'twilio',
    api_key: '',
    api_secret: '',
    phone_number: '',
    phone_number_id: '',
    business_account_id: '',
    webhook_verify_token: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setSettings({
          id: data.id,
          api_provider: data.api_provider,
          api_key: data.api_key || '',
          api_secret: data.api_secret || '',
          phone_number: data.phone_number || '',
          phone_number_id: data.phone_number_id || '',
          business_account_id: data.business_account_id || '',
          webhook_verify_token: data.webhook_verify_token || '',
        });
      }
    } catch (e: any) {
      console.error('Failed to load WhatsApp settings:', e);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        api_provider: settings.api_provider,
        api_key: settings.api_key,
        api_secret: settings.api_secret || null,
        phone_number: settings.phone_number,
        phone_number_id: settings.phone_number_id || null,
        business_account_id: settings.business_account_id || null,
        webhook_verify_token: settings.webhook_verify_token || null,
        is_active: true,
      };

      let error;
      if (settings.id) {
        ({ error } = await supabase
          .from('whatsapp_settings')
          .update(payload)
          .eq('id', settings.id));
      } else {
        ({ error } = await supabase
          .from('whatsapp_settings')
          .insert(payload));
      }
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'WhatsApp settings saved successfully',
      });
      
      await loadSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!settings.phone_number) {
      toast({
        title: 'Error',
        description: 'Please save your settings first',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            to: settings.phone_number.replace('whatsapp:', ''),
            message: 'Test message from Holistic Payment System ✅',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test message');
      }

      toast({
        title: 'Success',
        description: 'Test message sent! Check your WhatsApp.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">WhatsApp Configuration</CardTitle>
          <CardDescription className="text-gray-400">
            Configure your WhatsApp Business API settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-glass-text">API Provider</Label>
            <Select
              value={settings.api_provider}
              onValueChange={(value) => setSettings({ ...settings, api_provider: value })}
            >
              <SelectTrigger className="glass-input mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="whatsapp_business_api">WhatsApp Business API</SelectItem>
                <SelectItem value="vonage">Vonage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.api_provider === 'twilio' && (
            <>
              <div>
                <Label className="text-glass-text">Account SID</Label>
                <Input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                  className="glass-input mt-1"
                  placeholder="AC..."
                />
              </div>

              <div>
                <Label className="text-glass-text">Auth Token</Label>
                <Input
                  type="password"
                  value={settings.api_secret}
                  onChange={(e) => setSettings({ ...settings, api_secret: e.target.value })}
                  className="glass-input mt-1"
                />
              </div>

              <div>
                <Label className="text-glass-text">WhatsApp Phone Number</Label>
                <Input
                  placeholder="+234XXXXXXXXXX"
                  value={settings.phone_number}
                  onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                  className="glass-input mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Your Twilio WhatsApp number with country code</p>
              </div>
            </>
          )}

          {settings.api_provider === 'whatsapp_business_api' && (
            <>
              <div>
                <Label className="text-glass-text">Access Token</Label>
                <Input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                  className="glass-input mt-1"
                  placeholder="EAA..."
                />
              </div>

              <div>
                <Label className="text-glass-text">Phone Number ID</Label>
                <Input
                  value={settings.phone_number_id}
                  onChange={(e) => setSettings({ ...settings, phone_number_id: e.target.value })}
                  className="glass-input mt-1"
                />
              </div>

              <div>
                <Label className="text-glass-text">Business Account ID</Label>
                <Input
                  value={settings.business_account_id}
                  onChange={(e) => setSettings({ ...settings, business_account_id: e.target.value })}
                  className="glass-input mt-1"
                />
              </div>

              <div>
                <Label className="text-glass-text">Phone Number</Label>
                <Input
                  placeholder="+234XXXXXXXXXX"
                  value={settings.phone_number}
                  onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                  className="glass-input mt-1"
                />
              </div>

              <div>
                <Label className="text-glass-text">Webhook Verify Token</Label>
                <Input
                  value={settings.webhook_verify_token}
                  onChange={(e) => setSettings({ ...settings, webhook_verify_token: e.target.value })}
                  className="glass-input mt-1"
                  placeholder="Create a secure token"
                />
              </div>
            </>
          )}

          <div className="bg-slate-800/50 p-3 rounded-md">
            <Label className="text-glass-text text-sm">Webhook URL</Label>
            <div className="mt-1 flex items-center gap-2">
              <code className="text-xs text-gray-300 bg-slate-900/50 p-2 rounded flex-1 break-all">
                {webhookUrl}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="glass-button-outline"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast({ title: 'Copied', description: 'Webhook URL copied to clipboard' });
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Configure this URL in your {settings.api_provider === 'twilio' ? 'Twilio' : 'WhatsApp Business'} dashboard to receive incoming messages
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading} className="glass-button">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
            <Button onClick={testConnection} disabled={testing || !settings.id} variant="outline" className="glass-button-outline">
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
