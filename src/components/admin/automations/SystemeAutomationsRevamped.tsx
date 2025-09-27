import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Workflow } from 'lucide-react';
import AutomationRules from './AutomationRules';
import SystemeWorkflowBuilder from './SystemeWorkflowBuilder';

export default function SystemeAutomationsRevamped() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Automation Center</h1>
        <p className="text-gray-300">
          Create powerful automations to streamline your business processes
        </p>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="glass-card border-white/20 mb-6 bg-transparent">
          <TabsTrigger value="rules" className="text-white data-[state=active]:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-white data-[state=active]:bg-white/10">
            <Workflow className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <AutomationRules />
        </TabsContent>

        <TabsContent value="workflows">
          <SystemeWorkflowBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}