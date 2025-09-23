import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Facebook } from 'lucide-react';

export default function FacebookPixelSettings() {
  const [saving, setSaving] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [settings, setSettings] = useState({
    pixel_id: '',
    access_token: '',
    test_event_code: '',
    domain_verification: '',
    is_enabled: false
  });
  const { toast } = useToast();

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Mock save - in production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Facebook Pixel settings saved successfully'
      });
    } catch (error: any) {
      console.error('Error saving Facebook settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Facebook Pixel settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const maskAccessToken = (token: string) => {
    if (!token) return '';
    if (token.length <= 8) return '••••••••';
    return token.substring(0, 4) + '••••••••' + token.substring(token.length - 4);
  };


  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Facebook className="h-5 w-5" />
          Facebook Pixel Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white text-base">Enable Facebook Pixel</Label>
            <p className="text-gray-300 text-sm">Track conversions and optimize ads</p>
          </div>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, is_enabled: checked }))
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="pixel_id" className="text-white">Pixel ID</Label>
            <Input
              id="pixel_id"
              value={settings.pixel_id}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, pixel_id: e.target.value }))
              }
              placeholder="123456789012345"
              className="glass-input text-white border-white/20"
            />
          </div>

          <div>
            <Label htmlFor="access_token" className="text-white">Access Token</Label>
            <div className="relative">
              <Input
                id="access_token"
                type={showAccessToken ? 'text' : 'password'}
                value={showAccessToken ? settings.access_token : maskAccessToken(settings.access_token)}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, access_token: e.target.value }))
                }
                placeholder="EAAxxxxxxxxxxxxxx"
                className="glass-input text-white border-white/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-gray-400 hover:text-white"
                onClick={() => setShowAccessToken(!showAccessToken)}
              >
                {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="test_event_code" className="text-white">Test Event Code (Optional)</Label>
          <Input
            id="test_event_code"
            value={settings.test_event_code}
            onChange={(e) => 
              setSettings(prev => ({ ...prev, test_event_code: e.target.value }))
            }
            placeholder="TEST12345"
            className="glass-input text-white border-white/20"
          />
          <p className="text-gray-400 text-xs mt-1">
            Used for testing events in Facebook Events Manager
          </p>
        </div>

        <div>
          <Label htmlFor="domain_verification" className="text-white">Domain Verification Meta Tag</Label>
          <Textarea
            id="domain_verification"
            value={settings.domain_verification}
            onChange={(e) => 
              setSettings(prev => ({ ...prev, domain_verification: e.target.value }))
            }
            placeholder='<meta name="facebook-domain-verification" content="xxxxxxxxxx" />'
            className="glass-input text-white border-white/20"
            rows={3}
          />
          <p className="text-gray-400 text-xs mt-1">
            Paste the complete meta tag from Facebook Business Manager
          </p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            disabled={saving}
            className="glass-button"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}