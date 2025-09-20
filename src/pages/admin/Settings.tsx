
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { createAnimationVariant } from '@/utils/animationVariants';
import { Store, Bell, Shield, Palette, Save } from 'lucide-react';

interface StoreSettings {
  store_name: string;
  store_description: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  timezone: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  order_notifications: boolean;
  low_stock_alerts: boolean;
  customer_notifications: boolean;
}

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: '',
    store_description: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    currency: 'NGN',
    timezone: 'Africa/Lagos'
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    order_notifications: true,
    low_stock_alerts: true,
    customer_notifications: false
  });

  const cardVariants = createAnimationVariant({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Using mock data for settings since these tables don't exist yet
      setStoreSettings({
        store_name: 'Tenera Wellness Store',
        store_description: 'Premium wellness and holistic health products',
        store_email: 'info@tenerawellness.com',
        store_phone: '+234 XXX XXX XXXX',
        store_address: 'Lagos, Nigeria',
        currency: 'NGN',
        timezone: 'Africa/Lagos'
      });
      
      setNotificationSettings({
        email_notifications: true,
        order_notifications: true,
        low_stock_alerts: true,
        customer_notifications: false
      });
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Warning",
        description: "Some settings could not be loaded",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStoreSettings = async () => {
    setSaving(true);
    try {
      // Mock save for now
      toast({
        title: "Success",
        description: "Store settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving store settings:', error);
      toast({
        title: "Error",
        description: "Failed to save store settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // Mock save for now
      toast({
        title: "Success",
        description: "Notification settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store configuration and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="store_name">Store Name</Label>
                    <Input
                      id="store_name"
                      name="store_name"
                      autoComplete="organization"
                      value={storeSettings.store_name}
                      onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
                      placeholder="Your Store Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store_email">Store Email</Label>
                    <Input
                      id="store_email"
                      type="email"
                      name="store_email"
                      autoComplete="email"
                      value={storeSettings.store_email}
                      onChange={(e) => setStoreSettings({ ...storeSettings, store_email: e.target.value })}
                      placeholder="store@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store_phone">Store Phone</Label>
                    <Input
                      id="store_phone"
                      name="store_phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={storeSettings.store_phone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, store_phone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      name="currency"
                      autoComplete="off"
                      value={storeSettings.currency}
                      onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                      placeholder="NGN"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="store_description">Store Description</Label>
                  <Textarea
                    id="store_description"
                    name="store_description"
                    autoComplete="off"
                    value={storeSettings.store_description}
                    onChange={(e) => setStoreSettings({ ...storeSettings, store_description: e.target.value })}
                    placeholder="Describe your store..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="store_address">Store Address</Label>
                  <Textarea
                    id="store_address"
                    name="store_address"
                    autoComplete="street-address"
                    value={storeSettings.store_address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
                    placeholder="Your store address..."
                    rows={2}
                  />
                </div>
                <Button onClick={saveStoreSettings} disabled={saving} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Store Settings'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive general email notifications</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order_notifications">Order Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified about new orders</p>
                    </div>
                    <Switch
                      id="order_notifications"
                      checked={notificationSettings.order_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, order_notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-gray-600">Alert when products are running low</p>
                    </div>
                    <Switch
                      id="low_stock_alerts"
                      checked={notificationSettings.low_stock_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, low_stock_alerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="customer_notifications">Customer Notifications</Label>
                      <p className="text-sm text-gray-600">Notifications about customer activities</p>
                    </div>
                    <Switch
                      id="customer_notifications"
                      checked={notificationSettings.customer_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, customer_notifications: checked })
                      }
                    />
                  </div>
                </div>
                <Button onClick={saveNotificationSettings} disabled={saving} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Security settings will be available in a future update.</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Appearance customization will be available in a future update.</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
