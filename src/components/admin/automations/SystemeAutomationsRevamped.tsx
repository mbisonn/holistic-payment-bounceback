import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Settings, 
  Workflow, 
  Zap, 
  Mail, 
  ShoppingCart, 
  User, 
  
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export default function SystemeAutomationsRevamped() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    action: '',
    trigger_data: {},
    action_data: ''
  });
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [] as any[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch automation rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;
      setRules((rulesData || []).map(rule => ({
        ...rule,
        action_data: rule.action_data || ''
      })));

      // Fetch workflows (using automation_rules as base for workflows)
      const workflowsData = (rulesData || []).filter(rule => rule.trigger === 'workflow');
      setWorkflows(workflowsData);

    } catch (error: any) {
      console.error('Error fetching automations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      if (!newRule.name || !newRule.trigger || !newRule.action) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          ...newRule,
          trigger_data: JSON.stringify(newRule.trigger_data)
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation rule created successfully'
      });

      setCreateRuleOpen(false);
      setNewRule({
        name: '',
        trigger: '',
        action: '',
        trigger_data: {},
        action_data: ''
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rule',
        variant: 'destructive'
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Rule ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Rule deleted successfully'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'order_created': return <ShoppingCart className="h-4 w-4" />;
      case 'user_signup': return <User className="h-4 w-4" />;
      case 'email_opened': return <Mail className="h-4 w-4" />;
      case 'workflow': return <Workflow className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-white">Loading automations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Automations</h2>
          <p className="text-gray-300">Automate your marketing and sales processes</p>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="glass-card border-white/20 bg-transparent">
          <TabsTrigger value="rules" className="text-white data-[state=active]:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-white data-[state=active]:bg-white/20">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Automation Rules
                </CardTitle>
                <Button onClick={() => setCreateRuleOpen(true)} className="glass-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rules.filter(rule => rule.trigger !== 'workflow').length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No automation rules created yet</p>
                  <Button 
                    onClick={() => setCreateRuleOpen(true)} 
                    className="glass-button mt-4"
                  >
                    Create Your First Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.filter(rule => rule.trigger !== 'workflow').map((rule) => (
                    <div key={rule.id} className="glass-secondary p-4 rounded-lg border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTriggerIcon(rule.trigger)}
                            <h3 className="text-white font-medium">{rule.name}</h3>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span>When: {rule.trigger.replace('_', ' ')}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>Then: {rule.action.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Edit rule:', rule.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Workflows
                </CardTitle>
                <Button onClick={() => setCreateWorkflowOpen(true)} className="glass-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8">
                  <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No workflows created yet</p>
                  <Button 
                    onClick={() => setCreateWorkflowOpen(true)} 
                    className="glass-button mt-4"
                  >
                    Create Your First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="glass-secondary p-4 rounded-lg border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Workflow className="h-4 w-4" />
                            <h3 className="text-white font-medium">{workflow.name}</h3>
                            <Badge variant={workflow.is_active ? "default" : "secondary"}>
                              {workflow.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300">Multi-step automation workflow</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={workflow.is_active}
                            onCheckedChange={(checked) => toggleRuleStatus(workflow.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(workflow.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name" className="text-white">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Welcome new customers"
                className="glass-input text-white border-white/20"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="trigger" className="text-white">Trigger (When)</Label>
                <Select value={newRule.trigger} onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, trigger: value }))
                }>
                  <SelectTrigger className="glass-input text-white border-white/20">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="order_created">Order Created</SelectItem>
                    <SelectItem value="user_signup">User Signup</SelectItem>
                    <SelectItem value="email_opened">Email Opened</SelectItem>
                    <SelectItem value="cart_abandoned">Cart Abandoned</SelectItem>
                    <SelectItem value="tag_added">Tag Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action" className="text-white">Action (Then)</Label>
                <Select value={newRule.action} onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, action: value }))
                }>
                  <SelectTrigger className="glass-input text-white border-white/20">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="add_tag">Add Tag</SelectItem>
                    <SelectItem value="create_contact">Create Contact</SelectItem>
                    <SelectItem value="send_sms">Send SMS</SelectItem>
                    <SelectItem value="webhook">Call Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="action-data" className="text-white">Action Configuration</Label>
              <Textarea
                id="action-data"
                value={newRule.action_data}
                onChange={(e) => setNewRule(prev => ({ ...prev, action_data: e.target.value }))}
                placeholder="Email template ID, webhook URL, or other action data"
                className="glass-input text-white border-white/20"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateRuleOpen(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button onClick={createRule} className="glass-button">
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={createWorkflowOpen} onOpenChange={setCreateWorkflowOpen}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name" className="text-white">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer onboarding sequence"
                className="glass-input text-white border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="workflow-description" className="text-white">Description</Label>
              <Textarea
                id="workflow-description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does"
                className="glass-input text-white border-white/20"
                rows={3}
              />
            </div>

            <div className="text-center py-4 text-gray-400">
              Workflow builder coming soon! For now, create individual rules.
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateWorkflowOpen(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button disabled className="glass-button opacity-50">
                Create Workflow (Coming Soon)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}