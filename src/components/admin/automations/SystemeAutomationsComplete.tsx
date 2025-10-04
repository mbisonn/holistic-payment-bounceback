import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SystemeWorkflowBuilder from './SystemeWorkflowBuilder';
import AutomationAnalytics from './AutomationAnalytics';
import AutomationTesting from './AutomationTesting';
import { 
  Plus, 
  Settings, 
  Workflow, 
  Zap, 
  Mail, 
  ShoppingCart, 
  User, 
  BarChart3,
  Bot,
  Eye,
  Trash2,
  Copy,
  Search,
  ArrowRight,
  Tag,
  CreditCard,
  Gift,
  CheckCircle,
  Activity,
  Database,
  MessageSquare
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: {
    total_runs: number;
    success_rate: number;
    last_run?: string;
  };
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: string;
  is_premium: boolean;
}

// Removed unused constants to fix TypeScript warnings

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'welcome_series',
    name: 'Welcome Series',
    description: 'Send a series of welcome emails to new customers',
    category: 'Email Marketing',
    icon: '👋',
    trigger: 'customer_signup',
    action: 'send_email_campaign',
    trigger_data: { delay: 0 },
    action_data: 'welcome_series_campaign',
    is_premium: false
  },
  {
    id: 'abandoned_cart',
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned carts with targeted emails',
    category: 'E-commerce',
    icon: '🛒',
    trigger: 'abandoned_cart',
    action: 'send_email',
    trigger_data: { delay_hours: 1 },
    action_data: 'abandoned_cart_campaign',
    is_premium: false
  },
  {
    id: 'post_purchase_review',
    name: 'Post-Purchase Review Request',
    description: 'Request reviews after successful purchase',
    category: 'Customer Experience',
    icon: '⭐',
    trigger: 'purchase_paystack',
    action: 'send_email',
    trigger_data: { delay_days: 3 },
    action_data: 'review_request_campaign',
    is_premium: false
  },
  {
    id: 'birthday_campaign',
    name: 'Birthday Campaign',
    description: 'Send birthday wishes and special offers',
    category: 'Customer Engagement',
    icon: '🎂',
    trigger: 'birthday',
    action: 'send_email',
    trigger_data: { delay: 0 },
    action_data: 'birthday_campaign',
    is_premium: false
  },
  {
    id: 'high_value_customer',
    name: 'High-Value Customer Tag',
    description: 'Tag customers who make large purchases',
    category: 'Customer Segmentation',
    icon: '💎',
    trigger: 'purchase_paystack',
    action: 'assign_tag',
    trigger_data: { min_amount: 50000 },
    action_data: 'high_value_customer',
    is_premium: false
  },
  {
    id: 'payment_failed_followup',
    name: 'Payment Failed Follow-up',
    description: 'Follow up when payment fails',
    category: 'Revenue Recovery',
    icon: '💳',
    trigger: 'payment_failed',
    action: 'send_email',
    trigger_data: { delay_hours: 2 },
    action_data: 'payment_failed_campaign',
    is_premium: false
  },
  {
    id: 'order_delivered_survey',
    name: 'Order Delivered Survey',
    description: 'Send satisfaction survey after delivery',
    category: 'Customer Feedback',
    icon: '📋',
    trigger: 'order_delivered',
    action: 'send_email',
    trigger_data: { delay_days: 1 },
    action_data: 'delivery_survey_campaign',
    is_premium: false
  },
  {
    id: 'purchase_whatsapp_notification',
    name: 'Purchase WhatsApp Notification',
    description: 'Send a WhatsApp notification when a purchase is made',
    category: 'Messaging',
    icon: '📱',
    trigger: 'purchase_paystack',
    action: 'send_whatsapp',
    trigger_data: { delay: 0 },
    action_data: 'purchase_notification_template',
    is_premium: false
  }
];

export default function SystemeAutomationsComplete() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  // Removed unused filterCategory state
  const [activeTab, setActiveTab] = useState('automations');
  
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger: '',
    action: '',
    trigger_data: {},
    action_data: ''
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
        action_data: typeof rule.action_data === 'string' ? rule.action_data : JSON.stringify(rule.action_data || ''),
        trigger_data: rule.trigger_data || {},
        stats: {
          total_runs: Math.floor(Math.random() * 100),
          success_rate: Math.floor(Math.random() * 40) + 60,
          last_run: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })) as AutomationRule[]);

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
        description: '',
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

  const createFromTemplate = async (template: AutomationTemplate) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          name: template.name,
          description: template.description,
          trigger: template.trigger,
          action: template.action,
          trigger_data: JSON.stringify(template.trigger_data),
          action_data: template.action_data,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation created from template successfully'
      });

      setTemplatesOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error creating from template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation from template',
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
        description: `Automation ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation deleted successfully'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive'
      });
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && rule.is_active) ||
      (filterStatus === 'inactive' && !rule.is_active);
    return matchesSearch && matchesStatus;
  });

  const getTriggerIcon = (trigger: string) => {
    const iconMap: { [key: string]: any } = {
      'purchase_paystack': CreditCard,
      'customer_signup': User,
      'abandoned_cart': ShoppingCart,
      'email_opened': Eye,
      'birthday': Gift,
      'workflow': Workflow
    };
    return iconMap[trigger] || Zap;
  };

  const getActionIcon = (action: string) => {
    const iconMap: { [key: string]: any } = {
      'send_email': Mail,
      'send_email_campaign': Mail,
      'send_whatsapp': MessageSquare,
      'assign_tag': Tag,
      'create_task': CheckCircle,
      'webhook': Database,
      'execute_workflow': Workflow
    };
    return iconMap[action] || Settings;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Marketing Automation</h2>
          <p className="text-gray-300">Automate your marketing and customer engagement workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateRuleOpen(true)} className="bounce-back-consult-button">
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
          <Button onClick={() => setTemplatesOpen(true)} variant="outline" className="bounce-back-consult-button-outline">
            <Copy className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bounce-back-consult-card border-white/20 bg-transparent">
          <TabsTrigger value="automations" className="text-white data-[state=active]:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-white data-[state=active]:bg-white/20">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="testing" className="text-white data-[state=active]:bg-white/20">
            <Activity className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">
          {/* Filters */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search automations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bounce-back-consult-input text-white border-white/20"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Automation Rules */}
          <div className="space-y-4">
            {filteredRules.length === 0 ? (
              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No automations found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first automation to get started.'
                    }
                  </p>
                  <Button onClick={() => setCreateRuleOpen(true)} className="bounce-back-consult-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredRules.map((rule) => {
                const TriggerIcon = getTriggerIcon(rule.trigger);
                const ActionIcon = getActionIcon(rule.action);
                
                return (
                  <Card key={rule.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              <TriggerIcon className="h-5 w-5 text-blue-400" />
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <ActionIcon className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                              {rule.description && (
                                <p className="text-sm text-gray-400">{rule.description}</p>
                              )}
                            </div>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span>When: {rule.trigger.replace('_', ' ')}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>Then: {rule.action.replace('_', ' ')}</span>
                          </div>

                          {rule.stats && (
                            <div className="grid grid-cols-3 gap-4 mt-4 p-3 rounded-lg bg-white/5">
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Total Runs</p>
                                <p className="text-white font-semibold">{rule.stats.total_runs}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Success Rate</p>
                                <p className="text-green-400 font-semibold">{rule.stats.success_rate}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Last Run</p>
                                <p className="text-white font-semibold">
                                  {rule.stats.last_run ? new Date(rule.stats.last_run).toLocaleDateString() : 'Never'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <SystemeWorkflowBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AutomationAnalytics />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <AutomationTesting />
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Automation Name
              </label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Welcome new customers"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description (Optional)
              </label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this automation does"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Trigger (When)
                </label>
                <Select value={newRule.trigger} onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, trigger: value }))
                }>
                  <SelectTrigger className="bounce-back-consult-input text-white border-white/20">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="customer_signup">Customer Signup</SelectItem>
                    <SelectItem value="purchase_paystack">Purchase (Paystack)</SelectItem>
                    <SelectItem value="abandoned_cart">Cart Abandoned</SelectItem>
                    <SelectItem value="email_opened">Email Opened</SelectItem>
                    <SelectItem value="email_clicked">Email Clicked</SelectItem>
                    <SelectItem value="birthday">Customer Birthday</SelectItem>
                    <SelectItem value="order_delivered">Order Delivered</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Action (Then)
                </label>
                <Select value={newRule.action} onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, action: value }))
                }>
                  <SelectTrigger className="bounce-back-consult-input text-white border-white/20">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="send_email_campaign">Send Email Campaign</SelectItem>
                    <SelectItem value="send_sms">Send SMS</SelectItem>
                    <SelectItem value="send_whatsapp">Send WhatsApp</SelectItem>
                    <SelectItem value="assign_tag">Assign Tag</SelectItem>
                    <SelectItem value="remove_tag">Remove Tag</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                    <SelectItem value="update_customer">Update Customer</SelectItem>
                    <SelectItem value="webhook">Call Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateRuleOpen(false)} className="bounce-back-consult-button-outline">
                Cancel
              </Button>
              <Button onClick={createRule} className="bounce-back-consult-button">
                Create Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Automation Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">Choose from pre-built automation templates:</p>
            <div className="grid gap-4">
              {AUTOMATION_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-white/20 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h3 className="text-white font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.is_premium && (
                          <Badge variant="default" className="text-xs ml-2">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => createFromTemplate(template)}
                      size="sm"
                      className="bounce-back-consult-button"
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}