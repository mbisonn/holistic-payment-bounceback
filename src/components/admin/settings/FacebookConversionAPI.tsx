import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Save, TestTube, Zap, Eye, EyeOff } from 'lucide-react';

interface ConversionAPISettings {
  pixel_id: string;
  access_token: string;
  test_event_code?: string;
  is_enabled: boolean;
  domain_verification?: string;
}

export const FacebookConversionAPI = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ConversionAPISettings>({
    pixel_id: '',
    access_token: '',
    test_event_code: '',
    is_enabled: false,
    domain_verification: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // For now, use localStorage until the types are updated
      const stored = localStorage.getItem('facebook_conversion_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
        setConnectionStatus(parsedSettings.is_enabled ? 'connected' : 'disconnected');
      }
    } catch (error) {
      console.log('No Facebook settings found yet');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // For now, save to localStorage until types are updated
      localStorage.setItem('facebook_conversion_settings', JSON.stringify(settings));

      toast({
        title: "Success",
        description: "Facebook Conversion API settings saved successfully"
      });

      setConnectionStatus(settings.is_enabled ? 'connected' : 'disconnected');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!settings.pixel_id || !settings.access_token) {
      toast({
        title: "Missing Configuration",
        description: "Please enter Pixel ID and Access Token first",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      // Test the conversion API with a test event
      const testEvent = {
        event_name: 'Test',
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: {
          client_ip_address: '127.0.0.1',
          client_user_agent: navigator.userAgent
        }
      };

      const response = await fetch(`https://graph.facebook.com/v18.0/${settings.pixel_id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [testEvent],
          access_token: settings.access_token,
          test_event_code: settings.test_event_code
        })
      });

      const result = await response.json();

      if (response.ok) {
        setConnectionStatus('connected');
        toast({
          title: "Test Successful",
          description: "Facebook Conversion API connection is working correctly"
        });
      } else {
        setConnectionStatus('error');
        throw new Error(result.error?.message || 'Test failed');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Test Failed",
        description: error.message || "Failed to connect to Facebook API",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Facebook className="w-5 h-5 text-blue-500" />
              <span className="text-glass-visible">Facebook Conversion API</span>
            </div>
            <Badge className={`${getStatusColor()} text-white`}>
              {getStatusText()}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Configure Facebook Conversion API for enhanced tracking and attribution
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 glass-secondary rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <Label htmlFor="api-enabled" className="text-glass-visible">Enable Conversion API</Label>
            </div>
            <Switch
              id="api-enabled"
              checked={settings.is_enabled}
              onCheckedChange={(checked) => setSettings({...settings, is_enabled: checked})}
            />
          </div>

          {/* Pixel ID */}
          <div>
            <Label htmlFor="pixel-id" className="text-glass-visible">Facebook Pixel ID</Label>
            <Input
              id="pixel-id"
              value={settings.pixel_id}
              onChange={(e) => setSettings({...settings, pixel_id: e.target.value})}
              placeholder="123456789012345"
              className="glass-input mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find this in your Facebook Events Manager
            </p>
          </div>

          {/* Access Token */}
          <div>
            <Label htmlFor="access-token" className="text-glass-visible">Conversion API Access Token</Label>
            <div className="relative">
              <Input
                id="access-token"
                type={showToken ? "text" : "password"}
                value={settings.access_token}
                onChange={(e) => setSettings({...settings, access_token: e.target.value})}
                placeholder="EAAxxxxxxxxxxxxxx"
                className="glass-input mt-1 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate this token in your Facebook Business account
            </p>
          </div>

          {/* Test Event Code */}
          <div>
            <Label htmlFor="test-code" className="text-glass-visible">Test Event Code (Optional)</Label>
            <Input
              id="test-code"
              value={settings.test_event_code || ''}
              onChange={(e) => setSettings({...settings, test_event_code: e.target.value})}
              placeholder="TEST12345"
              className="glass-input mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use this to test events before going live
            </p>
          </div>

          {/* Domain Verification */}
          <div>
            <Label htmlFor="domain-verification" className="text-glass-visible">Domain Verification (Optional)</Label>
            <Textarea
              id="domain-verification"
              value={settings.domain_verification || ''}
              onChange={(e) => setSettings({...settings, domain_verification: e.target.value})}
              placeholder="Paste domain verification meta tag here..."
              rows={3}
              className="glass-input mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add domain verification for iOS 14.5+ tracking
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={testConnection}
              disabled={testing || !settings.pixel_id || !settings.access_token}
              variant="outline"
              className="glass-button-outline flex-1"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="glass-button flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Help Section */}
          <div className="glass-secondary p-4 rounded-lg">
            <h4 className="font-medium text-glass-visible mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to Facebook Events Manager and select your Pixel</li>
              <li>Navigate to Settings → Conversions API</li>
              <li>Generate an Access Token for server events</li>
              <li>Copy your Pixel ID and Access Token here</li>
              <li>Test the connection and enable the API</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};