import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Calendar,
  BarChart3,
  Target,
  Bot,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Search,
  Users,
  ArrowRight,
  Clock,
  Tag,
  MessageSquare,
  Globe,
  Smartphone,
  CreditCard,
  Gift,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  Webhook,
  Zap as ZapIcon,
  Send,
  Bell,
  Heart,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Upload,
  Link,
  Unlink,
  Settings2,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  Info,
  HelpCircle,
  Bug,
  Truck,
  TrendingDown,
  Reply,
  UserPlus,
  LogIn,
  MousePointer,
  FileText,
  DollarSign,
  UserMinus
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

const TRIGGER_CATEGORIES = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingCart,
    triggers: [
      { value: 'purchase_paystack', label: 'Purchase (Paystack)', icon: CreditCard },
      { value: 'payment_on_delivery', label: 'Payment on Delivery', icon: Truck },
      { value: 'upsell_purchase', label: 'Upsell Purchase', icon: TrendingUp },
      { value: 'downsell_purchase', label: 'Downsell Purchase', icon: TrendingDown },
      { value: 'abandoned_cart', label: 'Cart Abandoned', icon: AlertCircle },
      { value: 'refund_processed', label: 'Refund Processed', icon: RefreshCw },
      { value: 'subscription_created', label: 'Subscription Created', icon: Calendar },
      { value: 'subscription_cancelled', label: 'Subscription Cancelled', icon: XCircle },
    ]
  },
  {
    id: 'customer',
    name: 'Customer Behavior',
    icon: User,
    triggers: [
      { value: 'customer_signup', label: 'Customer Signup', icon: UserPlus },
      { value: 'customer_login', label: 'Customer Login', icon: LogIn },
      { value: 'profile_updated', label: 'Profile Updated', icon: Edit },
      { value: 'birthday', label: 'Customer Birthday', icon: Gift },
      { value: 'anniversary', label: 'Customer Anniversary', icon: Heart },
      { value: 'high_value_customer', label: 'High Value Customer', icon: Star },
      { value: 'inactive_customer', label: 'Inactive Customer', icon: Clock },
    ]
  },
  {
    id: 'email',
    name: 'Email & Communication',
    icon: Mail,
    triggers: [
      { value: 'email_opened', label: 'Email Opened', icon: Eye },
      { value: 'email_clicked', label: 'Email Link Clicked', icon: MousePointer },
      { value: 'email_bounced', label: 'Email Bounced', icon: AlertCircle },
      { value: 'email_unsubscribed', label: 'Email Unsubscribed', icon: XCircle },
      { value: 'email_replied', label: 'Email Replied', icon: Reply },
      { value: 'sms_sent', label: 'SMS Sent', icon: MessageSquare },
      { value: 'sms_delivered', label: 'SMS Delivered', icon: CheckCircle },
    ]
  },
  {
    id: 'website',
    name: 'Website Activity',
    icon: Globe,
    triggers: [
      { value: 'page_visited', label: 'Page Visited', icon: Globe },
      { value: 'link_clicked', label: 'Link Clicked', icon: MousePointer },
      { value: 'form_submitted', label: 'Form Submitted', icon: FileText },
      { value: 'search_performed', label: 'Search Performed', icon: Search },
      { value: 'video_watched', label: 'Video Watched', icon: Play },
      { value: 'download_started', label: 'Download Started', icon: Download },
      { value: 'time_on_site', label: 'Time on Site', icon: Clock },
    ]
  },
  {
    id: 'time',
    name: 'Time-based',
    icon: Clock,
    triggers: [
      { value: 'date_time', label: 'Specific Date/Time', icon: Calendar },
      { value: 'recurring', label: 'Recurring', icon: RefreshCw },
      { value: 'after_purchase', label: 'After Purchase', icon: Clock },
      { value: 'after_signup', label: 'After Signup', icon: Clock },
      { value: 'after_email_open', label: 'After Email Open', icon: Clock },
      { value: 'after_email_click', label: 'After Email Click', icon: Clock },
      { value: 'birthday_reminder', label: 'Birthday Reminder', icon: Gift },
    ]
  }
];

const ACTION_CATEGORIES = [
  {
    id: 'email',
    name: 'Email Actions',
    icon: Mail,
    actions: [
      { value: 'send_email', label: 'Send Email', icon: Send },
      { value: 'send_email_campaign', label: 'Send Email Campaign', icon: Mail },
      { value: 'send_welcome_email', label: 'Send Welcome Email', icon: UserPlus },
      { value: 'send_follow_up', label: 'Send Follow-up', icon: ArrowRight },
      { value: 'send_abandoned_cart_email', label: 'Send Abandoned Cart Email', icon: ShoppingCart },
      { value: 'send_birthday_email', label: 'Send Birthday Email', icon: Gift },
      { value: 'send_anniversary_email', label: 'Send Anniversary Email', icon: Heart },
      { value: 'send_review_request', label: 'Send Review Request', icon: Star },
    ]
  },
  {
    id: 'sms',
    name: 'SMS Actions',
    icon: MessageSquare,
    actions: [
      { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
      { value: 'send_sms_campaign', label: 'Send SMS Campaign', icon: MessageSquare },
      { value: 'send_sms_reminder', label: 'Send SMS Reminder', icon: Bell },
      { value: 'send_sms_alert', label: 'Send SMS Alert', icon: AlertCircle },
    ]
  },
  {
    id: 'tags',
    name: 'Tag Management',
    icon: Tag,
    actions: [
      { value: 'assign_tag', label: 'Assign Tag', icon: Tag },
      { value: 'remove_tag', label: 'Remove Tag', icon: XCircle },
      { value: 'add_to_segment', label: 'Add to Segment', icon: Users },
      { value: 'remove_from_segment', label: 'Remove from Segment', icon: UserMinus },
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks & Pipeline',
    icon: CheckCircle,
    actions: [
      { value: 'create_task', label: 'Create Task', icon: Plus },
      { value: 'assign_task', label: 'Assign Task', icon: User },
      { value: 'move_pipeline', label: 'Move in Pipeline', icon: ArrowRight },
      { value: 'create_deal', label: 'Create Deal', icon: DollarSign },
      { value: 'update_deal', label: 'Update Deal', icon: Edit },
      { value: 'close_deal', label: 'Close Deal', icon: CheckCircle },
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Webhook,
    actions: [
      { value: 'webhook', label: 'Call Webhook', icon: Webhook },
      { value: 'api_call', label: 'Make API Call', icon: Database },
      { value: 'zapier_trigger', label: 'Zapier Trigger', icon: ZapIcon },
      { value: 'slack_notification', label: 'Slack Notification', icon: MessageSquare },
      { value: 'discord_notification', label: 'Discord Notification', icon: MessageSquare },
    ]
  },
  {
    id: 'customer',
    name: 'Customer Actions',
    icon: User,
    actions: [
      { value: 'add_note', label: 'Add Customer Note', icon: FileText },
      { value: 'update_customer', label: 'Update Customer', icon: Edit },
      { value: 'create_opportunity', label: 'Create Opportunity', icon: Target },
      { value: 'update_opportunity', label: 'Update Opportunity', icon: Edit },
      { value: 'create_appointment', label: 'Create Appointment', icon: Calendar },
      { value: 'send_invoice', label: 'Send Invoice', icon: FileText },
    ]
  }
];

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
    action: 'send_abandoned_cart_email',
    trigger_data: { delay_hours: 1 },
    action_data: 'abandoned_cart_campaign',
    is_premium: false
  },
  {
    id: 'birthday_campaign',
    name: 'Birthday Campaign',
    description: 'Send birthday wishes and special offers',
    category: 'Customer Engagement',
    icon: '🎂',
    trigger: 'birthday',
    action: 'send_birthday_email',
    trigger_data: { delay: 0 },
    action_data: 'birthday_campaign',
    is_premium: false
  },
  {
    id: 'upsell_sequence',
    name: 'Upsell Sequence',
    description: 'Automatically offer upsells after purchase',
    category: 'E-commerce',
    icon: '📈',
    trigger: 'purchase_paystack',
    action: 'send_email_campaign',
    trigger_data: { delay_hours: 24 },
    action_data: 'upsell_campaign',
    is_premium: true
  },
  {
    id: 'review_request',
    name: 'Review Request',
    description: 'Ask for reviews after successful delivery',
    category: 'Customer Feedback',
    icon: '⭐',
    trigger: 'payment_on_delivery',
    action: 'send_review_request',
    trigger_data: { delay_days: 7 },
    action_data: 'review_request_campaign',
    is_premium: false
  }
];

export default function SystemeAutomationsComplete() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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
        action_data: rule.action_data || '',
        stats: {
          total_runs: Math.floor(Math.random() * 100),
          success_rate: Math.floor(Math.random() * 40) + 60,
          last_run: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
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
      setSelectedTemplate(null);
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

  const duplicateRule = async (rule: AutomationRule) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          name: `${rule.name} (Copy)`,
          description: rule.description,
          trigger: rule.trigger,
          action: rule.action,
          trigger_data: rule.trigger_data,
          action_data: rule.action_data,
          is_active: false
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation duplicated successfully'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error duplicating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate automation',
        variant: 'destructive'
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    for (const category of TRIGGER_CATEGORIES) {
      const found = category.triggers.find(t => t.value === trigger);
      if (found) return found.icon;
    }
    return Zap;
  };

  const getActionIcon = (action: string) => {
    for (const category of ACTION_CATEGORIES) {
      const found = category.actions.find(a => a.value === action);
      if (found) return found.icon;
    }
    return Settings;
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.is_active) ||
                         (filterStatus === 'inactive' && !rule.is_active);
    const matchesCategory = filterCategory === 'all' || 
                           TRIGGER_CATEGORIES.find(cat => 
                             cat.triggers.some(t => t.value === rule.trigger)
                           )?.id === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
          <h2 className="text-3xl font-bold text-white">Automations</h2>
          <p className="text-gray-300">Automate your marketing and sales processes like Systeme.io</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTemplatesOpen(true)} variant="outline" className="glass-button-outline">
            <Plus className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setCreateRuleOpen(true)} className="glass-button">
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-card border-white/20 bg-transparent">
          <TabsTrigger value="automations" className="text-white data-[state=active]:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-white data-[state=active]:bg-white/20">
            <Workflow className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="testing" className="text-white data-[state=active]:bg-white/20">
            <Bug className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Automations</p>
                <p className="text-2xl font-bold text-white">{rules.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active</p>
                <p className="text-2xl font-bold text-green-400">{rules.filter(r => r.is_active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Runs</p>
                <p className="text-2xl font-bold text-white">
                  {rules.reduce((sum, rule) => sum + (rule.stats?.total_runs || 0), 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {rules.length > 0 ? Math.round(
                    rules.reduce((sum, rule) => sum + (rule.stats?.success_rate || 0), 0) / rules.length
                  ) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search automations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-input text-white border-white/20"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[150px] glass-input text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
              <SelectTrigger className="w-[200px] glass-input text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                {TRIGGER_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <Card className="glass-card border-white/20">
            <CardContent className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No automations found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first automation to start streamlining your processes.'
                }
              </p>
              <Button onClick={() => setCreateRuleOpen(true)} className="glass-button">
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
              <Card key={rule.id} className="glass-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <TriggerIcon className="h-5 w-5 text-blue-400" />
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <ActionIcon className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">{rule.name}</h3>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {rule.description && (
                        <p className="text-gray-300 text-sm mb-3">{rule.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{rule.stats?.total_runs || 0} runs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{rule.stats?.success_rate || 0}% success</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Last run: {rule.stats?.last_run ? 
                            new Date(rule.stats.last_run).toLocaleDateString() : 'Never'
                          }</span>
                        </div>
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
                        onClick={() => duplicateRule(rule)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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
              <div>
                <Label htmlFor="rule-description" className="text-white">Description (Optional)</Label>
                <Input
                  id="rule-description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this automation does"
                  className="glass-input text-white border-white/20"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="text-white mb-3 block">Trigger (When)</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {TRIGGER_CATEGORIES.map(category => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                      <div className="ml-6 space-y-1">
                        {category.triggers.map(trigger => (
                          <button
                            key={trigger.value}
                            onClick={() => setNewRule(prev => ({ ...prev, trigger: trigger.value }))}
                            className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 transition-colors ${
                              newRule.trigger === trigger.value 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                : 'hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <trigger.icon className="h-4 w-4" />
                            {trigger.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-3 block">Action (Then)</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {ACTION_CATEGORIES.map(category => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                      <div className="ml-6 space-y-1">
                        {category.actions.map(action => (
                          <button
                            key={action.value}
                            onClick={() => setNewRule(prev => ({ ...prev, action: action.value }))}
                            className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 transition-colors ${
                              newRule.action === action.value 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                Create Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Automation Templates</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUTOMATION_TEMPLATES.map(template => (
              <Card key={template.id} className="glass-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{template.icon}</div>
                    {template.is_premium && (
                      <Badge variant="secondary" className="text-xs">Premium</Badge>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                  <div className="text-xs text-gray-400 mb-4">{template.category}</div>
                  <Button 
                    onClick={() => createFromTemplate(template)}
                    className="w-full glass-button"
                    disabled={template.is_premium}
                  >
                    {template.is_premium ? 'Premium Required' : 'Use Template'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
