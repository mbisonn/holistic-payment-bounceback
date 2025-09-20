import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Zap, 
  Mail, 
  ShoppingCart, 
  User, 
  Edit,
  Trash2,
  ArrowRight,
  Search
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TRIGGER_OPTIONS = [
  { value: 'order_created', label: 'Order Created', icon: ShoppingCart, color: 'bg-green-500' },
  { value: 'order_completed', label: 'Order Completed', icon: ShoppingCart, color: 'bg-green-600' },
  { value: 'customer_registered', label: 'Customer Registered', icon: User, color: 'bg-blue-500' },
  { value: 'email_opened', label: 'Email Opened', icon: Mail, color: 'bg-purple-500' },
  { value: 'email_clicked', label: 'Email Clicked', icon: Mail, color: 'bg-purple-600' },
  { value: 'product_viewed', label: 'Product Viewed', icon: ShoppingCart, color: 'bg-orange-500' },
  { value: 'cart_abandoned', label: 'Cart Abandoned', icon: ShoppingCart, color: 'bg-red-500' },
  { value: 'subscription_created', label: 'Subscription Created', icon: User, color: 'bg-indigo-500' },
  { value: 'subscription_cancelled', label: 'Subscription Cancelled', icon: User, color: 'bg-red-600' },
];

const ACTION_OPTIONS = [
  { value: 'send_email', label: 'Send Email', icon: Mail, color: 'bg-blue-500' },
  { value: 'add_tag', label: 'Add Tag', icon: User, color: 'bg-green-500' },
  { value: 'remove_tag', label: 'Remove Tag', icon: User, color: 'bg-red-500' },
  { value: 'update_customer', label: 'Update Customer', icon: User, color: 'bg-purple-500' },
  { value: 'create_order', label: 'Create Order', icon: ShoppingCart, color: 'bg-orange-500' },
  { value: 'send_sms', label: 'Send SMS', icon: Mail, color: 'bg-teal-500' },
  { value: 'webhook', label: 'Webhook', icon: Zap, color: 'bg-gray-500' },
  { value: 'delay', label: 'Delay', icon: ArrowRight, color: 'bg-yellow-500' },
];

export default function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    action: '',
    trigger_data: {},
    action_data: {},
    is_active: true
  });
  
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
          is_active: rule.is_active ?? false
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
          name: newRule.name,
          trigger: newRule.trigger,
          action: newRule.action,
          trigger_data: newRule.trigger_data,
          action_data: newRule.action_data,
          is_active: newRule.is_active
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
        action_data: {},
        is_active: true
      });
      fetchRules();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create automation rule',
        variant: 'destructive'
      });
    }
  };

  const updateRule = async () => {
    if (!editingRule) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({
          name: newRule.name,
          trigger: newRule.trigger,
          action: newRule.action,
          trigger_data: newRule.trigger_data,
          action_data: newRule.action_data,
          is_active: newRule.is_active
        })
        .eq('id', editingRule.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Automation rule updated successfully'
      });

      setEditingRule(null);
      setCreateRuleOpen(false);
      setNewRule({
        name: '',
        trigger: '',
        action: '',
        trigger_data: {},
        action_data: {},
        is_active: true
      });
      fetchRules();
    } catch (error: any) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update automation rule',
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

  const openEditDialog = (rule: AutomationRule) => {
    setEditingRule(rule);
    setNewRule({
      name: rule.name,
      trigger: rule.trigger,
      action: rule.action,
      trigger_data: rule.trigger_data || {},
      action_data: rule.action_data || {},
      is_active: rule.is_active
    });
    setCreateRuleOpen(true);
  };

  const closeDialog = () => {
    setCreateRuleOpen(false);
    setEditingRule(null);
    setNewRule({
      name: '',
      trigger: '',
      action: '',
      trigger_data: {},
      action_data: {},
      is_active: true
    });
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.is_active) ||
                         (filterStatus === 'inactive' && !rule.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const getTriggerOption = (trigger: string) => 
    TRIGGER_OPTIONS.find(opt => opt.value === trigger) || TRIGGER_OPTIONS[0];
  
  const getActionOption = (action: string) => 
    ACTION_OPTIONS.find(opt => opt.value === action) || ACTION_OPTIONS[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Automation Rules</h2>
          <p className="text-gray-400">Create simple trigger-action automation rules</p>
        </div>
        <Button 
          onClick={() => setCreateRuleOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rules</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule) => {
          const triggerOption = getTriggerOption(rule.trigger);
          const actionOption = getActionOption(rule.action);
          const TriggerIcon = triggerOption.icon;
          const ActionIcon = actionOption.icon;

          return (
            <Card key={rule.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{rule.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                    />
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trigger */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${triggerOption.color}`}>
                    <TriggerIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Trigger</p>
                    <p className="text-white font-medium">{triggerOption.label}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Action */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${actionOption.color}`}>
                    <ActionIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Action</p>
                    <p className="text-white font-medium">{actionOption.label}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(rule)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No automation rules found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first automation rule to get started'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button 
              onClick={() => setCreateRuleOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Rule
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Rule Dialog */}
      <Dialog open={createRuleOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Rule Name */}
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Enter rule name..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Trigger */}
            <div>
              <Label htmlFor="trigger">Trigger</Label>
              <Select value={newRule.trigger} onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Action */}
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={newRule.action} onValueChange={(value) => setNewRule({ ...newRule, action: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <Switch
                checked={newRule.is_active}
                onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
              />
              <Label>Active</Label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={editingRule ? updateRule : createRule}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

