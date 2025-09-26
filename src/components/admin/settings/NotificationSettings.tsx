import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Mail, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  id?: string;
  setting_type: string;
  email_addresses: string[];
  is_active: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    setting_type: 'activity_notifications',
    email_addresses: ['ebuchenna1@gmail.com', 'bouncebacktolifeconsult@gmail.com', 'info@bouncebacktolifeconsult.pro', 'pecjos2017@gmail.com'],
    is_active: true
  });
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Mock save - in production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    if (newEmail && !settings.email_addresses.includes(newEmail)) {
      setSettings(prev => ({
        ...prev,
        email_addresses: [...prev.email_addresses, newEmail]
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      email_addresses: prev.email_addresses.filter(email => email !== emailToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-white">Activity Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Enable Notifications</Label>
              <p className="text-white/60 text-sm mt-1">
                Send email notifications for important activities
              </p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white font-medium">Notification Recipients</Label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="glass-input flex-1"
                type="email"
              />
              <Button 
                onClick={addEmail}
                className="glass-button"
                disabled={!newEmail}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {settings.email_addresses.map((email, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 text-white border-white/20"
                >
                  <Mail className="w-3 h-3" />
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-1 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {settings.email_addresses.length === 0 && (
              <p className="text-white/50 text-sm text-center py-4">
                No email addresses configured for notifications
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button 
              onClick={saveSettings}
              disabled={loading}
              className="glass-button"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">New Orders</p>
                <p className="text-white/60 text-sm">Get notified when new orders are placed</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">User Registrations</p>
                <p className="text-white/60 text-sm">Get notified when new users sign up</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Payment Confirmations</p>
                <p className="text-white/60 text-sm">Get notified when payments are confirmed</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">System Alerts</p>
                <p className="text-white/60 text-sm">Get notified about system issues and updates</p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}