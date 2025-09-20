import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

import { BarChart3, TestTube } from 'lucide-react';
import { initializeGTM, trackPurchaseEvent } from '@/utils/gtmUtils';

interface GTMSettings {
  gtm_id: string;
  ga4_measurement_id: string;
  is_enabled: boolean;
}

export default function GTMSettingsEnhanced() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<GTMSettings>({
    gtm_id: 'GTM-MQ6HKDRG',
    ga4_measurement_id: '',
    is_enabled: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // For now, use default settings since we don't have a GTM settings table
      // You can create a table later if needed
      const defaultSettings = {
        gtm_id: 'GTM-MQ6HKDRG',
        ga4_measurement_id: '',
        is_enabled: true
      };
      setSettings(defaultSettings);
    } catch (error: any) {
      console.error('Error fetching GTM settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load GTM settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Initialize GTM with new settings
      if (settings.is_enabled && settings.gtm_id) {
        initializeGTM(settings.gtm_id);
      }

      // Here you could save to a database table if needed
      toast({
        title: 'Success',
        description: 'GTM settings saved successfully'
      });
    } catch (error: any) {
      console.error('Error saving GTM settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save GTM settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testGTM = async () => {
    setTesting(true);
    try {
      // Test GTM by sending a test event
      trackPurchaseEvent({
        transaction_id: 'test_' + Date.now(),
        value: 99.99,
        currency: 'NGN',
        items: [{
          item_id: 'test_product',
          item_name: 'Test Product',
          category: 'Test Category',
          quantity: 1,
          price: 99.99
        }],
        customer_data: {
          email: 'test@example.com'
        }
      });

      toast({
        title: 'Test Event Sent',
        description: 'Check GTM Debug mode or GA4 Real-time reports'
      });
    } catch (error: any) {
      console.error('Error testing GTM:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to send test event',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/20">
        <CardContent className="pt-6">
          <div className="text-center text-white">Loading GTM settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Google Tag Manager Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white text-base">Enable GTM</Label>
            <p className="text-gray-300 text-sm">Track user interactions and conversions</p>
          </div>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, is_enabled: checked }))
            }
          />
        </div>

        <div>
          <Label htmlFor="gtm_id" className="text-white">GTM Container ID</Label>
          <Input
            id="gtm_id"
            value={settings.gtm_id}
            onChange={(e) => 
              setSettings(prev => ({ ...prev, gtm_id: e.target.value }))
            }
            placeholder="GTM-XXXXXXX"
            className="glass-input text-white border-white/20"
          />
          <p className="text-gray-400 text-xs mt-1">
            Your Google Tag Manager container ID
          </p>
        </div>

        <div>
          <Label htmlFor="ga4_id" className="text-white">GA4 Measurement ID (Optional)</Label>
          <Input
            id="ga4_id"
            value={settings.ga4_measurement_id}
            onChange={(e) => 
              setSettings(prev => ({ ...prev, ga4_measurement_id: e.target.value }))
            }
            placeholder="G-XXXXXXXXXX"
            className="glass-input text-white border-white/20"
          />
          <p className="text-gray-400 text-xs mt-1">
            Your Google Analytics 4 measurement ID
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button 
            onClick={testGTM}
            disabled={testing || !settings.is_enabled}
            variant="outline"
            className="glass-button-outline"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Event
              </>
            )}
          </Button>
          
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