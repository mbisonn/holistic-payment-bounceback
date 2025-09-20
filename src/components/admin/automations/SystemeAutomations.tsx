import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  Search,
  Users,
  Mail,
  ShoppingBag,
  Calendar,
  BarChart3,
  Target,
  Workflow,
  Bot,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  trigger_data?: any;
  action_data?: string;
  is_active: boolean;
  created_at: string;
}

const triggerTypes = [
  { id: 'order_placed', name: 'Order Placed', icon: ShoppingBag, color: 'bg-green-500', description: 'When a customer places an order' },
  { id: 'user_signup', name: 'User Signup', icon: Users, color: 'bg-blue-500', description: 'When someone signs up' },
  { id: 'email_opened', name: 'Email Opened', icon: Mail, color: 'bg-purple-500', description: 'When an email is opened' },
  { id: 'cart_abandoned', name: 'Cart Abandoned', icon: Target, color: 'bg-orange-500', description: 'When cart is abandoned' },
  { id: 'time_based', name: 'Time Based', icon: Calendar, color: 'bg-indigo-500', description: 'Based on time triggers' },
];

const actionTypes = [
  { id: 'send_email', name: 'Send Email', icon: Mail, color: 'bg-red-500', description: 'Send an email to contact' },
  { id: 'add_tag', name: 'Add Tag', icon: Target, color: 'bg-yellow-500', description: 'Add a tag to contact' },
  { id: 'create_task', name: 'Create Task', icon: BarChart3, color: 'bg-pink-500', description: 'Create a task' },
  { id: 'webhook', name: 'Webhook', icon: Zap, color: 'bg-cyan-500', description: 'Send data to webhook' },
];

export default function SystemeAutomations() {
  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  

  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Automation status updated');
    },
    onError: (error) => {
      toast.error('Failed to update automation: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Automation deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete automation: ' + error.message);
    }
  });

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && automation.is_active) ||
                         (filterStatus === 'inactive' && !automation.is_active);
    const matchesTab = activeTab === 'rules' || activeTab === 'workflows';
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getTriggerInfo = (trigger: string) => {
    return triggerTypes.find(t => t.id === trigger) || 
           { id: trigger, name: trigger, icon: Workflow, color: 'bg-gray-500', description: 'Custom trigger' };
  };

  const getActionInfo = (action: string) => {
    return actionTypes.find(a => a.id === action) || 
           { id: action, name: action, icon: Bot, color: 'bg-gray-500', description: 'Custom action' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Automations</h1>
            <p className="text-white/70 mt-1 text-sm md:text-base">Automate your business workflows with rules and workflows</p>
          </div>
          <Button 
            className="glass-button w-full md:w-auto" 
            onClick={() => toast.info('Create automation functionality coming soon')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card p-1">
            <TabsTrigger value="rules" className="flex items-center gap-2 text-sm md:text-base">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2 text-sm md:text-base">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="glass-input text-sm px-3 py-2 w-full md:w-auto"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline" size="sm" className="glass-button-outline">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="rules" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-white/20 rounded"></div>
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-8 bg-white/10 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAutomations.map((automation) => {
                  const triggerInfo = getTriggerInfo(automation.trigger);
                  const actionInfo = getActionInfo(automation.action);
                  
                  return (
                    <Card key={automation.id} className="glass-card hover:glass-card-hover transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-lg truncate">{automation.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={automation.is_active ? "default" : "secondary"} className="text-xs">
                                {automation.is_active ? (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3 h-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={(checked) => 
                                toggleMutation.mutate({ id: automation.id, is_active: checked })
                              }
                            />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Trigger */}
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className={`p-2 rounded-lg ${triggerInfo.color}`}>
                            <triggerInfo.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{triggerInfo.name}</p>
                            <p className="text-white/60 text-xs truncate">{triggerInfo.description}</p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className={`p-2 rounded-lg ${actionInfo.color}`}>
                            <actionInfo.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{actionInfo.name}</p>
                            <p className="text-white/60 text-xs truncate">{actionInfo.description}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/70 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/70 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/70 hover:text-white">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            onClick={() => deleteMutation.mutate(automation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-xs text-white/50">
                          Created {new Date(automation.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredAutomations.length === 0 && !isLoading && (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Settings className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Rules Yet</h3>
                  <p className="text-white/70 mb-4 text-sm md:text-base">Create your first automation rule to streamline your processes</p>
                  <Button onClick={() => toast.info('Create workflow functionality coming soon')} className="glass-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Workflow className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Workflows Yet</h3>
                <p className="text-white/70 mb-4 text-sm md:text-base">Create advanced workflows with multiple steps and conditions</p>
                  <Button onClick={() => toast.info('Create rule functionality coming soon')} className="glass-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workflow
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}