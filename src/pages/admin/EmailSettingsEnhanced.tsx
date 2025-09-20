
import { useState, useEffect } from 'react';
import { Save, Settings, Mail, Server, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailSettings {
  id: string;
  from_name: string | null;
  from_email: string | null;
  smtp_enabled: boolean | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string | null;
  admin_recipients: string[] | null;
}

const EmailSettingsEnhanced = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    smtp_enabled: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    admin_recipients: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setFormData({
          from_name: data.from_name || '',
          from_email: data.from_email || '',
          smtp_enabled: data.smtp_enabled || false,
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || 587,
          smtp_username: data.smtp_username || '',
          smtp_password: data.smtp_password || '',
          admin_recipients: data.admin_recipients || []
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsData = {
        from_name: formData.from_name || null,
        from_email: formData.from_email || null,
        smtp_enabled: formData.smtp_enabled,
        smtp_host: formData.smtp_host || null,
        smtp_port: formData.smtp_port,
        smtp_username: formData.smtp_username || null,
        smtp_password: formData.smtp_password || null,
        admin_recipients: formData.admin_recipients
      };

      if (settings) {
        const { error } = await supabase
          .from('email_settings')
          .update(settingsData)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_settings')
          .insert([settingsData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Email Settings
          </h1>
          <p className="text-muted-foreground">Configure your email delivery settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basic Settings
            </CardTitle>
            <CardDescription>
              Configure your default sender information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  value={formData.from_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_email: e.target.value }))}
                  placeholder="noreply@yourdomain.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP server for email delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="smtp_enabled"
                checked={formData.smtp_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smtp_enabled: checked }))}
              />
              <Label htmlFor="smtp_enabled">Enable SMTP</Label>
              <Badge variant={formData.smtp_enabled ? "default" : "secondary"}>
                {formData.smtp_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {formData.smtp_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={formData.smtp_host}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={formData.smtp_port}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={formData.smtp_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtp_username: e.target.value }))}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={formData.smtp_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Recipients
            </CardTitle>
            <CardDescription>
              Email addresses that should receive admin notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="admin_recipients">Admin Email Addresses</Label>
              <Textarea
                id="admin_recipients"
                value={formData.admin_recipients.join('\n')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  admin_recipients: e.target.value.split('\n').filter(email => email.trim()) 
                }))}
                placeholder="admin@yourdomain.com&#10;manager@yourdomain.com"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter one email address per line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettingsEnhanced;
