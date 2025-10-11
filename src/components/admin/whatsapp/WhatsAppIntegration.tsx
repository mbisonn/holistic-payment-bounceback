import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare } from 'lucide-react';
import WhatsAppSettings from './WhatsAppSettings';
import WhatsAppTemplates from './WhatsAppTemplates';
import WhatsAppCampaigns from './WhatsAppCampaigns';

export default function WhatsAppIntegration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          WhatsApp Integration
        </h2>
        <p className="text-gray-300 mt-2">Manage WhatsApp messaging, templates, and campaigns</p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <WhatsAppSettings />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <WhatsAppTemplates />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <WhatsAppCampaigns />
        </TabsContent>
      </Tabs>
    </div>
  );
}
