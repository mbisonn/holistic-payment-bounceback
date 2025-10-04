import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Send,
  MessageSquare,
  Timer,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Filter
} from 'lucide-react';
import { 
  FunnelAutomation, 
  FunnelAutomationTemplate, 
  SYSTEME_AUTOMATION_TEMPLATES,
  getTriggerDisplayName,
  getActionDisplayName,
  FunnelAutomationType,
  SystemeTriggerType,
  SystemeActionType
} from '@/types/systeme-funnel-types';

export default function SystemeFunnelAutomations() {
  const [automations, setAutomations] = useState<FunnelAutomation[]>([]);
  const [templates, setTemplates] = useState<FunnelAutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createAutomationOpen, setCreateAutomationOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rule' | 'workflow'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState('automations');
  
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    type: 'rule' as FunnelAutomationType,
    funnel_id: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch funnel automations
      const { data: automationsData, error: automationsError } = await supabase
        .from('funnel_automations')
        .select(`
          *,
          triggers: funnel_automation_triggers(*),
          conditions: funnel_automation_conditions(*),
          actions: funnel_automation_actions(*)
        `)
        .order('created_at', { ascending: false });

      if (automationsError) throw automationsError;

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('funnel_automation_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      setAutomations(automationsData || []);
      setTemplates(templatesData || []);

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

  const createAutomation = async () => {
    try {
      if (!newAutomation.name || !newAutomation.type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('funnel_automations')
        .insert([{
          name: newAutomation.name,
          description: newAutomation.description,
          type: newAutomation.type,
          funnel_id: newAutomation.funnel_id || null,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation created successfully'
      });

      setCreateAutomationOpen(false);
      setNewAutomation({
        name: '',
        description: '',
        type: 'rule',
        funnel_id: ''
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation',
        variant: 'destructive'
      });
    }
  };

  const createFromTemplate = async (template: FunnelAutomationTemplate) => {
    try {
      // Create the main automation
      const { data: automationData, error: automationError } = await supabase
        .from('funnel_automations')
        .insert([{
          name: template.name,
          description: template.description,
          type: template.template_data.type,
          is_active: true
        }])
        .select()
        .single();

      if (automationError) throw automationError;

      // Create triggers
      if (template.template_data.triggers.length > 0) {
        const triggers = template.template_data.triggers.map((trigger, index) => ({
          automation_id: automationData.id,
          trigger_type: trigger.type,
          trigger_config: trigger.config,
          order_index: index
        }));

        const { error: triggersError } = await supabase
          .from('funnel_automation_triggers')
          .insert(triggers);

        if (triggersError) throw triggersError;
      }

      // Create conditions
      if (template.template_data.conditions.length > 0) {
        const conditions = template.template_data.conditions.map((condition, index) => ({
          automation_id: automationData.id,
          condition_type: condition.type,
          condition_config: condition.config,
          order_index: index
        }));

        const { error: conditionsError } = await supabase
          .from('funnel_automation_conditions')
          .insert(conditions);

        if (conditionsError) throw conditionsError;
      }

      // Create actions
      if (template.template_data.actions.length > 0) {
        const actions = template.template_data.actions.map((action, index) => ({
          automation_id: automationData.id,
          action_type: action.type,
          action_config: action.config,
          order_index: index,
          delay_minutes: action.delay || 0
        }));

        const { error: actionsError } = await supabase
          .from('funnel_automation_actions')
          .insert(actions);

        if (actionsError) throw actionsError;
      }

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

  const toggleAutomationStatus = async (automationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('funnel_automations')
        .update({ is_active: isActive })
        .eq('id', automationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Automation ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation',
        variant: 'destructive'
      });
    }
  };

  const deleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const { error } = await supabase
        .from('funnel_automations')
        .delete()
        .eq('id', automationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation deleted successfully'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive'
      });
    }
  };

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || automation.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && automation.is_active) ||
      (filterStatus === 'inactive' && !automation.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getAutomationIcon = (type: FunnelAutomationType) => {
    return type === 'workflow' ? Workflow : Zap;
  };

  const getTriggerIcon = (triggerType: string) => {
    const iconMap: { [key: string]: any } = {
      'form_submitted': User,
      'purchase_completed': CreditCard,
      'checkout_abandoned': ShoppingCart,
      'tag_added': Tag,
      'webinar_registered': Calendar,
      'email_opened': Mail,
      'email_clicked': Mail
    };
    return iconMap[triggerType] || Zap;
  };

  const getActionIcon = (actionType: string) => {
    const iconMap: { [key: string]: any } = {
      'send_email': Mail,
      'assign_tag': Tag,
      'notify_team': Users,
      'subscribe_campaign': Send,
      'conditional_action': Filter,
      'send_webhook': Database
    };
    return iconMap[actionType] || Settings;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-white">Loading funnel automations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Systeme.io Funnel Automations</h2>
          <p className="text-gray-300">Create automated workflows and rules for your funnels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateAutomationOpen(true)} className="bounce-back-consult-button">
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
          <TabsTrigger value="templates" className="text-white data-[state=active]:bg-white/20">
            <Copy className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
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
                
                <Select value={filterType} onValueChange={(value: 'all' | 'rule' | 'workflow') => setFilterType(value)}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rule">Rules</SelectItem>
                    <SelectItem value="workflow">Workflows</SelectItem>
                  </SelectContent>
                </Select>

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

          {/* Automation List */}
          <div className="space-y-4">
            {filteredAutomations.length === 0 ? (
              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No automations found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first funnel automation to get started.'
                    }
                  </p>
                  <Button onClick={() => setCreateAutomationOpen(true)} className="bounce-back-consult-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredAutomations.map((automation) => {
                const AutomationIcon = getAutomationIcon(automation.type);
                
                return (
                  <Card key={automation.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <AutomationIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
                              {automation.description && (
                                <p className="text-sm text-gray-400">{automation.description}</p>
                              )}
                            </div>
                            <Badge variant={automation.is_active ? "default" : "secondary"}>
                              {automation.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {automation.type === 'workflow' ? 'Workflow' : 'Rule'}
                            </Badge>
                          </div>
                          
                          {/* Triggers */}
                          {automation.triggers && automation.triggers.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 mb-2">Triggers:</p>
                              <div className="flex flex-wrap gap-2">
                                {automation.triggers.map((trigger) => {
                                  const TriggerIcon = getTriggerIcon(trigger.trigger_type);
                                  return (
                                    <div key={trigger.id} className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
                                      <TriggerIcon className="h-3 w-3 text-blue-400" />
                                      <span className="text-xs text-gray-300">
                                        {getTriggerDisplayName(trigger.trigger_type as SystemeTriggerType)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {automation.actions && automation.actions.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 mb-2">Actions:</p>
                              <div className="flex flex-wrap gap-2">
                                {automation.actions.map((action) => {
                                  const ActionIcon = getActionIcon(action.action_type);
                                  return (
                                    <div key={action.id} className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
                                      <ActionIcon className="h-3 w-3 text-green-400" />
                                      <span className="text-xs text-gray-300">
                                        {getActionDisplayName(action.action_type as SystemeActionType)}
                                      </span>
                                      {action.delay_minutes > 0 && (
                                        <>
                                          <Timer className="h-3 w-3 text-yellow-400 ml-1" />
                                          <span className="text-xs text-yellow-400">
                                            {action.delay_minutes < 60 
                                              ? `${action.delay_minutes}m` 
                                              : `${Math.floor(action.delay_minutes / 60)}h`
                                            }
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Created {new Date(automation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={automation.is_active}
                            onCheckedChange={(checked) => toggleAutomationStatus(automation.id, checked)}
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
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteAutomation(automation.id)}
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
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Workflow Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Workflow Builder Coming Soon</h3>
                <p className="text-gray-400 mb-4">
                  Visual workflow builder with drag-and-drop interface will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4">
            {SYSTEME_AUTOMATION_TEMPLATES.map((template) => (
              <Card key={template.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant={template.template_data.type === 'workflow' ? "default" : "secondary"}>
                          {template.template_data.type === 'workflow' ? 'Workflow' : 'Rule'}
                        </Badge>
                        {template.is_premium && (
                          <Badge variant="default">Premium</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-gray-400 mb-4">{template.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Triggers:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.template_data.triggers.map((trigger, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {getTriggerDisplayName(trigger.type as SystemeTriggerType)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.template_data.actions.map((action, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {getActionDisplayName(action.type as SystemeActionType)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => createFromTemplate(template)}
                      className="bounce-back-consult-button"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Automation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-400 mb-4">
                  Detailed analytics and performance metrics will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Automation Dialog */}
      <Dialog open={createAutomationOpen} onOpenChange={setCreateAutomationOpen}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Funnel Automation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Automation Name</Label>
              <Input
                value={newAutomation.name}
                onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Welcome new leads"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Description (Optional)</Label>
              <Textarea
                value={newAutomation.description}
                onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this automation does"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-white mb-2">Type</Label>
                <Select value={newAutomation.type} onValueChange={(value: FunnelAutomationType) => 
                  setNewAutomation(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger className="bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="rule">Rule (Event → Action)</SelectItem>
                    <SelectItem value="workflow">Workflow (Multi-step)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2">Funnel ID (Optional)</Label>
                <Input
                  value={newAutomation.funnel_id}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, funnel_id: e.target.value }))}
                  placeholder="funnel-uuid"
                  className="bounce-back-consult-input text-white border-white/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateAutomationOpen(false)} className="bounce-back-consult-button-outline">
                Cancel
              </Button>
              <Button onClick={createAutomation} className="bounce-back-consult-button">
                Create Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Automation Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">Choose from pre-built Systeme.io-style automation templates:</p>
            <div className="grid gap-4">
              {SYSTEME_AUTOMATION_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-white/20 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant={template.template_data.type === 'workflow' ? "default" : "secondary"}>
                          {template.template_data.type === 'workflow' ? 'Workflow' : 'Rule'}
                        </Badge>
                        {template.is_premium && (
                          <Badge variant="default">Premium</Badge>
                        )}
                      </div>
                      <h3 className="text-white font-medium mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Triggers:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.template_data.triggers.map((trigger, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {getTriggerDisplayName(trigger.type as SystemeTriggerType)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.template_data.actions.map((action, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {getActionDisplayName(action.type as SystemeActionType)}
                              </Badge>
                            ))}
                          </div>
                        </div>
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

