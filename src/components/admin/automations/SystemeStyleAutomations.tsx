import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AutomationRuleBuilder from './AutomationRuleBuilder';
import { 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Zap,
  Settings,
  Tag,
  Mail,
  User,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  Gift,
  Database,
  GraduationCap,
  Video,
  FileText,
  CreditCard,
  XCircle,
  ArrowRight,
  BarChart3,
  Eye,
  Star,
  Users,
  TrendingUp,
  Award,
  Crown,
  Heart,
  AlertTriangle,
  DollarSign,
  MessageCircle,
  Calendar,
  Package,
  RotateCcw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUTOMATION_TEMPLATES, getPopularTemplates, getBeginnerTemplates, getPremiumTemplates, searchTemplates } from './templates/AutomationTemplates';

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: {
    total_runs: number;
    success_rate: number;
    last_run?: string;
  };
}

type ViewMode = 'list' | 'builder' | 'templates';

const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  // Triggers
  tag_added: Tag,
  tag_removed: Tag,
  funnel_form_subscribed: FileText,
  blog_form_subscribed: FileText,
  digital_store_form_subscribed: ShoppingCart,
  campaign_completed: CheckCircle,
  registered_to_webinar: Video,
  enrolled_in_course: GraduationCap,
  new_sale: CreditCard,
  
  // Actions
  subscribe_to_campaign: Mail,
  unsubscribe_from_campaign: Mail,
  add_tag: Tag,
  remove_tag: Tag,
  send_email: Mail,
  send_email_to_specific: Mail,
  enroll_in_course: GraduationCap,
  revoke_course_access: GraduationCap,
  
  // Legacy triggers/actions
  order_created: ShoppingCart,
  order_completed: ShoppingCart,
  customer_registered: User,
  email_opened: Mail,
  email_clicked: Mail,
  product_viewed: ShoppingCart,
  cart_abandoned: ShoppingCart,
  subscription_created: User,
  subscription_cancelled: User,
  send_sms: MessageSquare,
  webhook: Database,
  delay: Clock,
  update_customer: User,
  create_order: ShoppingCart
};

export default function SystemeStyleAutomations() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRules((data || []).map(rule => ({
        ...rule,
        is_active: rule.is_active ?? false,
        stats: {
          total_runs: Math.floor(Math.random() * 1000),
          success_rate: Math.floor(Math.random() * 40) + 60,
          last_run: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })));
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation rules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (rule: AutomationRule) => {
    try {
      if (rule.id) {
        // Update existing rule
        const { error } = await supabase
          .from('automation_rules')
          .update({
            name: rule.name,
            description: rule.description,
            trigger: rule.trigger,
            action: rule.action,
            trigger_data: rule.trigger_data,
            action_data: rule.action_data,
            is_active: rule.is_active
          })
          .eq('id', rule.id);

        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('automation_rules')
          .insert([{
            name: rule.name,
            description: rule.description,
            trigger: rule.trigger,
            action: rule.action,
            trigger_data: rule.trigger_data,
            action_data: rule.action_data,
            is_active: rule.is_active
          }]);

        if (error) throw error;
      }

      await fetchRules();
      setViewMode('list');
      setEditingRule(null);
    } catch (error: any) {
      throw error;
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
        description: `Rule ${isActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchRules();
    } catch (error: any) {
      console.error('Error toggling rule status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation rule deleted successfully'
      });

      fetchRules();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation rule',
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
        description: 'Automation rule duplicated successfully'
      });

      fetchRules();
    } catch (error: any) {
      console.error('Error duplicating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate automation rule',
        variant: 'destructive'
      });
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.is_active) ||
                         (filterStatus === 'inactive' && !rule.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const getStepIcon = (stepId: string) => {
    return STEP_ICONS[stepId] || Settings;
  };

  const getStepName = (stepId: string) => {
    return stepId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const createFromTemplate = async (template: any) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          name: template.name,
          description: template.description,
          trigger: template.trigger.type,
          action: template.actions[0]?.type || 'send_email',
          trigger_data: template.trigger.config,
          action_data: template.actions[0]?.config || {},
          is_active: false
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation created from template successfully'
      });

      fetchRules();
      setViewMode('list');
    } catch (error: any) {
      console.error('Error creating from template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation from template',
        variant: 'destructive'
      });
    }
  };

  const getFilteredTemplates = () => {
    let templates = AUTOMATION_TEMPLATES;

    if (templateSearchTerm) {
      templates = searchTemplates(templateSearchTerm);
    }

    if (selectedTemplateCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedTemplateCategory);
    }

    return templates;
  };

  const getTemplateCategories = () => {
    const categories = new Set(AUTOMATION_TEMPLATES.map(template => template.category));
    return Array.from(categories);
  };

  const renderContent = () => {
    if (viewMode === 'templates') {
      return (
        <div className="mt-0">
          {/* Template Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getTemplateCategories().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTemplateCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplateCategory('all')}
              >
                All Templates
              </Button>
              <Button
                variant={selectedTemplateCategory === 'Email Marketing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplateCategory('Email Marketing')}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email Marketing
              </Button>
              <Button
                variant={selectedTemplateCategory === 'E-commerce' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplateCategory('E-commerce')}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                E-commerce
              </Button>
              <Button
                variant={selectedTemplateCategory === 'Customer Engagement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplateCategory('Customer Engagement')}
              >
                <Users className="h-3 w-3 mr-1" />
                Engagement
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTemplates().map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {template.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      
                      {template.isPremium && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>

                    {/* Template Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{template.estimatedSetupTime}</span>
                        <span>•</span>
                        <span className="capitalize">{template.difficulty}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expected Results */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Expected Results:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.expectedResults.slice(0, 2).map((result, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={() => createFromTemplate(template)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {getFilteredTemplates().length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-0">
        {filteredRules.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'No automations found'
                : 'No automation rules yet'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first automation rule to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                onClick={() => setViewMode('builder')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first automation
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.map((rule) => {
              const TriggerIcon = getStepIcon(rule.trigger);
              const ActionIcon = getStepIcon(rule.action);

              return (
                <Card key={rule.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {rule.name}
                        </CardTitle>
                        {rule.description && (
                          <p className="text-sm text-gray-500">{rule.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                        />
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <TriggerIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Trigger</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getStepName(rule.trigger)}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <ActionIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Action</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getStepName(rule.action)}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    {rule.stats && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {rule.stats.total_runs} runs
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {rule.stats.success_rate}% success
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRule(rule);
                          setViewMode('builder');
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateRule(rule)}
                        className="px-3"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                        className="px-3 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (viewMode === 'builder') {
    return (
      <AutomationRuleBuilder
        rule={editingRule || undefined}
        onSave={handleSaveRule}
        onCancel={() => {
          setViewMode('list');
          setEditingRule(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automation Rules</h1>
            <p className="text-gray-500 mt-1">
              Create powerful automations to streamline your business processes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setViewMode('templates')}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Star className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={() => setViewMode('builder')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create automation
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              My Automations
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rules</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}
