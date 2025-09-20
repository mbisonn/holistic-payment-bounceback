
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BarChart3 } from 'lucide-react';

const TrackingSettings = () => {
  const { toast } = useToast();
  const [trackingSettings, setTrackingSettings] = useState({
    enableAnalytics: true,
    gtmId: 'GTM-5T3R5262',
    ga4Id: '',
    facebookPixelId: '',
    enableFacebookPixel: false,
    enableEcommerce: true,
    enableEnhancedEcommerce: true,
    enableConversionTracking: true,
  });

  const updateTrackingSetting = (key: string, value: string | boolean) => {
    setTrackingSettings((prev: typeof trackingSettings) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTracking = () => {
    toast({
      title: "Tracking Settings Saved!",
      description: "Your tracking configuration has been updated successfully.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-blue-900 shadow-xl bg-gray-800 text-gray-100">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Analytics & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Tabs defaultValue="gtm" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 text-gray-100 border-gray-700">
              <TabsTrigger value="gtm" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-400">Google Analytics</TabsTrigger>
              <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-400">Facebook Pixel</TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-400">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="gtm">
              <Label className="text-gray-200">GTM ID</Label>
              <Input className="bg-gray-900 text-white border-gray-700 placeholder-gray-400" value={trackingSettings.gtmId} onChange={e => updateTrackingSetting('gtmId', e.target.value)} />
            </TabsContent>
            <TabsContent value="facebook">
              <Label className="text-gray-200">Facebook Pixel ID</Label>
              <Input className="bg-gray-900 text-white border-gray-700 placeholder-gray-400" value={trackingSettings.facebookPixelId} onChange={e => updateTrackingSetting('facebookPixelId', e.target.value)} />
            </TabsContent>
            <TabsContent value="advanced">
              <Label className="text-gray-200">Advanced Settings</Label>
              {/* Add more advanced settings here as needed */}
            </TabsContent>
          </Tabs>
          <Button onClick={handleSaveTracking} className="bg-blue-900 hover:bg-blue-800 text-blue-300">Save Settings</Button>
        </CardContent>
      </Card>  
    </motion.div>
  );
};

export default TrackingSettings;
