import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Mail, 
  Truck, 
  Save,
  Bell,
  Shield,
  Palette,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GTMSettingsEnhanced from '@/components/admin/settings/GTMSettingsEnhanced';
import FacebookPixelSettings from '@/components/admin/settings/FacebookPixelSettings';
import EmailSettingsEnhanced from '@/components/admin/settings/EmailSettingsEnhanced';
import { FacebookConversionAPI } from '@/components/admin/settings/FacebookConversionAPI';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';
import { supabase } from '@/integrations/supabase/client';

const SettingsSection = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: ''
  });

  const [shippingSettings, setShippingSettings] = useState({
    defaultShippingFee: '',
    freeShippingThreshold: '',
    shippingZones: ''
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    enableNotifications: true,
    enableAnalytics: true,
    maintenanceMode: false
  });

  const [pixelScript, setPixelScript] = useState('');
  const [pixelLoading, setPixelLoading] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const { toast } = useToast();

  // Toggle sensitive data visibility
  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData);
  };

  // Toggle edit mode for specific sections

  // Mask sensitive data
  const maskData = (data: string, type: 'email' | 'password' | 'script' | 'text') => {
    if (!showSensitiveData) {
      switch (type) {
        case 'email':
          return data.replace(/(.{2}).*@/, '$1***@');
        case 'password':
          return '••••••••';
        case 'script':
          return '<!-- Hidden for security -->';
        case 'text':
          return data.length > 10 ? data.substring(0, 10) + '...' : data;
        default:
          return '••••••••';
      }
    }
    return data;
  };

  // Load Facebook Pixel script from settings table
  useEffect(() => {
    const fetchPixel = async () => {
      setPixelLoading(true);
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('trigger_data')
          .eq('name', 'Facebook Pixel Script')
          .eq('trigger', 'page_load')
          .eq('action', 'inject_script')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          const triggerData = JSON.parse(String(data.trigger_data || '{}'));
          setPixelScript(triggerData.script || '<!-- Facebook Pixel Script -->');
        } else {
          setPixelScript('<!-- Facebook Pixel Script -->');
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to load Facebook Pixel code', variant: 'destructive' });
        setPixelScript('<!-- Facebook Pixel Script -->');
      } finally {
        setPixelLoading(false);
      }
    };
    fetchPixel();
  }, []);

  // Load Email Settings from database and sync Gmail connection state
  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('trigger_data')
          .eq('name', 'Email Settings')
          .eq('trigger', 'system')
          .eq('action', 'email_config')
          .single();

        if (error && (error as any).code !== 'PGRST116') {
          throw error;
        }

        if (data && data.trigger_data) {
          const settings = JSON.parse(String(data.trigger_data || '{}')) as typeof emailSettings;
          setEmailSettings({
            smtpHost: settings.smtpHost || '',
            smtpPort: settings.smtpPort || '',
            smtpUser: settings.smtpUser || '',
            smtpPassword: settings.smtpPassword || '',
            fromEmail: settings.fromEmail || '',
            fromName: settings.fromName || ''
          });

          // Derive Gmail connection state from saved settings
          const derivedEmail = settings.fromEmail || settings.smtpUser || '';
          if (derivedEmail) {
            setGmailStatus('connected');
            setGmailEmail(derivedEmail);
          } else {
            setGmailStatus('disconnected');
            setGmailEmail(null);
          }
        }
      } catch (e) {
        // Non-blocking
      }
    };
    fetchEmailSettings();
  }, []);

  // Load General Settings from database
  useEffect(() => {
    const fetchGeneralSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('trigger_data')
          .eq('name', 'General Settings')
          .eq('trigger', 'system')
          .eq('action', 'general_config')
          .single();

        if (error && (error as any).code !== 'PGRST116') {
          throw error;
        }

        if (data && data.trigger_data) {
          const settings = JSON.parse(String(data.trigger_data || '{}')) as typeof generalSettings;
          setGeneralSettings({
            siteName: settings.siteName || '',
            siteDescription: settings.siteDescription || '',
            enableNotifications: settings.enableNotifications !== undefined ? settings.enableNotifications : true,
            enableAnalytics: settings.enableAnalytics !== undefined ? settings.enableAnalytics : true,
            maintenanceMode: settings.maintenanceMode !== undefined ? settings.maintenanceMode : false
          });
        }
      } catch (e) {
        // Non-blocking
      }
    };
    fetchGeneralSettings();
  }, []);

  // Load Shipping Settings from database
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('trigger_data')
          .eq('name', 'Shipping Settings')
          .eq('trigger', 'system')
          .eq('action', 'shipping_config')
          .single();

        if (error && (error as any).code !== 'PGRST116') {
          throw error;
        }

        if (data && data.trigger_data) {
          const settings = JSON.parse(String(data.trigger_data || '{}')) as typeof shippingSettings;
          setShippingSettings({
            defaultShippingFee: settings.defaultShippingFee || '',
            freeShippingThreshold: settings.freeShippingThreshold || '',
            shippingZones: settings.shippingZones || ''
          });
        }
      } catch (e) {
        // Non-blocking
      }
    };
    fetchShippingSettings();
  }, []);

  // Sync Gmail status with email settings changes
  useEffect(() => {
    const primaryEmail = emailSettings.fromEmail || emailSettings.smtpUser || '';
    if (primaryEmail) {
      setGmailStatus('connected');
      setGmailEmail(primaryEmail);
    } else {
      setGmailStatus('disconnected');
      setGmailEmail(null);
    }
  }, [emailSettings.fromEmail, emailSettings.smtpUser]);

  // Initialize Gmail status from email settings on mount
  useEffect(() => {
    if (emailSettings.fromEmail || emailSettings.smtpUser) {
      const primaryEmail = emailSettings.fromEmail || emailSettings.smtpUser;
      setGmailStatus('connected');
      setGmailEmail(primaryEmail);
    }
  }, []); // Only run on mount

  // Save Facebook Pixel script to settings table
  const savePixelScript = async () => {
    setPixelLoading(true);
    try {
      // Save to automation_rules table
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          name: 'Facebook Pixel Script',
          trigger: 'page_load',
          action: 'inject_script',
          trigger_data: JSON.stringify({ script: pixelScript }),
          is_active: true
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Facebook Pixel code saved globally.' });
      // Inject the script into the DOM
      injectPixelScript(pixelScript);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save Facebook Pixel code', variant: 'destructive' });
    } finally {
      setPixelLoading(false);
    }
  };

  // Inject the pixel script into the DOM
  const injectPixelScript = (code: string) => {
    // Remove any previous pixel script
    const prev = document.getElementById('fb-pixel-script');
    if (prev) prev.remove();
    // Create a new script tag
    const script = document.createElement('script');
    script.id = 'fb-pixel-script';
    script.type = 'text/javascript';
    script.innerHTML = code;
    document.head.appendChild(script);
    // Handle noscript (optional)
    if (code.includes('<noscript>')) {
      const noscriptMatch = code.match(/<noscript>([\s\S]*?)<\/noscript>/);
      if (noscriptMatch) {
        const noscript = document.createElement('div');
        noscript.id = 'fb-pixel-noscript';
        noscript.innerHTML = noscriptMatch[1];
        document.body.appendChild(noscript);
      }
    }
  };

  const saveEmailSettings = async () => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          name: 'Email Settings',
          trigger: 'system',
          action: 'email_config',
          trigger_data: JSON.stringify(emailSettings),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email settings saved successfully'
      });

      // Keep Gmail connection in sync with saved email settings
      const primaryEmail = emailSettings.fromEmail || emailSettings.smtpUser;
      if (primaryEmail) {
        setGmailStatus('connected');
        setGmailEmail(primaryEmail);
      } else {
        setGmailStatus('disconnected');
        setGmailEmail(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save email settings',
        variant: 'destructive'
      });
    }
  };

  const saveShippingSettings = async () => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          name: 'Shipping Settings',
          trigger: 'system',
          action: 'shipping_config',
          trigger_data: JSON.stringify(shippingSettings),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Shipping settings saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save shipping settings',
        variant: 'destructive'
      });
    }
  };

  const saveGeneralSettings = async () => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          name: 'General Settings',
          trigger: 'system',
          action: 'general_config',
          trigger_data: JSON.stringify(generalSettings),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'General settings saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save general settings',
        variant: 'destructive'
      });
    }
  };

  // Simulated Gmail OAuth connect/disconnect that also syncs Email Settings
  const handleConnectGmail = async () => {
    setLoading(true);
    try {
      // In a real flow, obtain the Gmail account from OAuth callback
      // For now, we'll use a prompt to simulate getting the email
      const connectedEmail = prompt('Enter your Gmail address:') || 'user@gmail.com';
      
      if (!connectedEmail.includes('@gmail.com')) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid Gmail address',
          variant: 'destructive'
        });
        return;
      }

      // Reflect connection status
      setGmailStatus('connected');
      setGmailEmail(connectedEmail);

      // Update Email Settings to match Gmail
      const next = {
        ...emailSettings,
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: connectedEmail,
        fromEmail: connectedEmail,
        fromName: emailSettings.fromName || 'Your Store Name'
      };
      setEmailSettings(next);

      // Persist immediately so both tabs stay in sync on reload
      await supabase
        .from('automation_rules')
        .upsert({
          name: 'Email Settings',
          trigger: 'system',
          action: 'email_config',
          trigger_data: JSON.stringify(next),
          is_active: true
        });

      toast({
        title: 'Success',
        description: `Gmail connected successfully: ${connectedEmail}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect Gmail',
        variant: 'destructive'
        });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
    setGmailStatus('disconnected');
    setGmailEmail(null);

    // Clear email linkage when disconnecting
    const next = {
      ...emailSettings,
      smtpUser: '',
      fromEmail: ''
    };
    setEmailSettings(next);

    // Persist immediately
    await supabase
      .from('automation_rules')
      .upsert({
        name: 'Email Settings',
        trigger: 'system',
        action: 'email_config',
        trigger_data: JSON.stringify(next),
        is_active: true
      });

      toast({
        title: 'Success',
        description: 'Gmail disconnected successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect Gmail',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-300">Configure your application settings</p>
        </div>
        <Button
          variant="outline"
          onClick={toggleSensitiveData}
          className="glass-button-outline"
        >
          {showSensitiveData ? 'Hide' : 'Show'} All Sensitive Data
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 glass-card border-white/20">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="gtm" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>GTM</span>
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Facebook API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Gmail Connection Section */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Gmail Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Connect your Gmail account to enable email sending, analytics, and more. Each user can connect their own Gmail securely.</p>
              <div className="flex items-center gap-4 mb-2">
                <span className={`px-2 py-1 rounded text-xs ${gmailStatus === 'connected' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'glass-secondary'}`}>{gmailStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                {gmailEmail && <span className="text-sm text-gray-300">{gmailEmail}</span>}
              </div>
              {gmailStatus === 'connected' ? (
                <Button onClick={handleDisconnectGmail} variant="destructive" className="glass-button-outline">Disconnect</Button>
              ) : (
                <Button onClick={handleConnectGmail} disabled={loading} className="glass-button">{loading ? 'Connecting...' : 'Connect Gmail'}</Button>
              )}
            </CardContent>
          </Card>

          {/* Site Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Settings className="w-5 h-5" />
                  <span>Site Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName" className="text-white">Site Name</Label>
                    <Input
                      id="siteName"
                      value={showSensitiveData ? generalSettings.siteName : maskData(generalSettings.siteName, 'text')}
                      onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                      placeholder="BounceBack Life Consult"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={showSensitiveData ? generalSettings.siteDescription : maskData(generalSettings.siteDescription, 'text')}
                      onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                      placeholder="Your one-stop shop for wellness products"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <Label htmlFor="enableNotifications" className="text-white">Enable Notifications</Label>
                    </div>
                    <Switch
                      id="enableNotifications"
                      checked={generalSettings.enableNotifications}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, enableNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4" />
                      <Label htmlFor="enableAnalytics" className="text-white">Enable Analytics</Label>
                    </div>
                    <Switch
                      id="enableAnalytics"
                      checked={generalSettings.enableAnalytics}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, enableAnalytics: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <Label htmlFor="maintenanceMode" className="text-white">Maintenance Mode</Label>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                    />
                  </div>
                </div>

                <Button onClick={saveGeneralSettings} className="w-full glass-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Facebook Pixel Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Facebook Pixel</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="facebookPixel" className="text-white">Facebook Pixel Code</Label>
                <Textarea
                  id="facebookPixel"
                  value={pixelScript}
                  onChange={e => setPixelScript(e.target.value)}
                  placeholder="Paste your Facebook Pixel code here..."
                  rows={8}
                  className="font-mono text-xs glass-input text-white border-white/20"
                  disabled={pixelLoading}
                />
                <Button onClick={savePixelScript} className="mt-2 w-full glass-button" disabled={pixelLoading}>
                  {pixelLoading ? 'Saving...' : 'Save Facebook Pixel'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Mail className="w-5 h-5" />
                  <span>Email Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost" className="text-white">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={showSensitiveData ? emailSettings.smtpHost : maskData(emailSettings.smtpHost, 'text')}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                      placeholder="smtp.gmail.com"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort" className="text-white">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={showSensitiveData ? emailSettings.smtpPort : maskData(emailSettings.smtpPort, 'text')}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                      placeholder="587"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtpUser" className="text-white">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={showSensitiveData ? emailSettings.smtpUser : maskData(emailSettings.smtpUser, 'email')}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                    placeholder="your-email@gmail.com"
                    className="glass-input text-white border-white/20"
                    disabled={!showSensitiveData}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword" className="text-white">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                      type={showSensitiveData ? "password" : "text"}
                      value={showSensitiveData ? emailSettings.smtpPassword : maskData(emailSettings.smtpPassword, 'password')}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    placeholder="••••••••"
                    className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail" className="text-white">From Email</Label>
                    <Input
                      id="fromEmail"
                      value={showSensitiveData ? emailSettings.fromEmail : maskData(emailSettings.fromEmail, 'email')}
                      onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                      placeholder="noreply@yourstore.com"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName" className="text-white">From Name</Label>
                    <Input
                      id="fromName"
                      value={showSensitiveData ? emailSettings.fromName : maskData(emailSettings.fromName, 'text')}
                      onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                      placeholder="Your Store Name"
                      className="glass-input text-white border-white/20"
                      disabled={!showSensitiveData}
                    />
                  </div>
                </div>
                <Button onClick={saveEmailSettings} className="w-full glass-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Truck className="w-5 h-5" />
                  <span>Shipping Settings</span>
                </CardTitle>

              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultShippingFee" className="text-white">Default Shipping Fee (₦)</Label>
                  <Input
                    id="defaultShippingFee"
                    value={showSensitiveData ? shippingSettings.defaultShippingFee : maskData(shippingSettings.defaultShippingFee, 'text')}
                    onChange={(e) => setShippingSettings({...shippingSettings, defaultShippingFee: e.target.value})}
                    placeholder="2000"
                    className="glass-input text-white border-white/20"
                    disabled={!showSensitiveData}
                  />
                </div>
                <div>
                  <Label htmlFor="freeShippingThreshold" className="text-white">Free Shipping Threshold (₦)</Label>
                  <Input
                    id="freeShippingThreshold"
                    value={showSensitiveData ? shippingSettings.freeShippingThreshold : maskData(shippingSettings.freeShippingThreshold, 'text')}
                    onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: e.target.value})}
                    placeholder="50000"
                    className="glass-input text-white border-white/20"
                    disabled={!showSensitiveData}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingZones" className="text-white">Shipping Zones</Label>
                  <Textarea
                    id="shippingZones"
                    value={showSensitiveData ? shippingSettings.shippingZones : maskData(shippingSettings.shippingZones, 'text')}
                    onChange={(e) => setShippingSettings({...shippingSettings, shippingZones: e.target.value})}
                    placeholder="Lagos: 1500, Abuja: 2000, Other States: 3000"
                    rows={3}
                    className="glass-input text-white border-white/20"
                    disabled={!showSensitiveData}
                  />
                </div>
                <Button onClick={saveShippingSettings} className="w-full glass-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save Shipping Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="gtm" className="space-y-6">
        <GTMSettingsEnhanced />
        <FacebookPixelSettings />
        <EmailSettingsEnhanced />
        </TabsContent>

        <TabsContent value="facebook" className="space-y-6">
          <FacebookConversionAPI />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsSection;