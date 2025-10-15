import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StepSelectionModal from './StepSelectionModal';
import {
  Plus,
  Save, 
  Play,
  Pause,
  Settings, 
  Mail, 
  Clock,
  Tag,
  MessageSquare,
  CreditCard,
  Gift,
  CheckCircle,
  Database,
  XCircle,
  User, 
  Zap,
  X,
  Trash2,
  Eye,
  Target,
  Filter,
  ArrowRight,
  BarChart3,
  ShoppingCart as ShoppingCartIcon
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id?: string;
  name: string;
  description: string | null;
  nodes: WorkflowNode[];
  is_active: boolean | null;
}

const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  // Triggers
  tag_added: Tag,
  tag_removed: Tag,
  funnel_form_subscribed: Database,
  blog_form_subscribed: Database,
  digital_store_form_subscribed: ShoppingCartIcon,
  campaign_completed: CheckCircle,
  registered_to_webinar: Eye,
  enrolled_in_course: User,
  new_sale: CreditCard,
  
  // Actions
  subscribe_to_campaign: Mail,
  unsubscribe_from_campaign: Mail,
  add_tag: Tag,
  remove_tag: Tag,
  send_email: Mail,
  send_email_to_specific: Mail,
  enroll_in_course: User,
  revoke_course_access: User,
  
  // Decisions
  has_tag: Tag,
  purchase_value: CreditCard,
  customer_segment: User,
  order_count: ShoppingCartIcon,
  
  // Delays
  wait_minutes: Clock,
  wait_hours: Clock,
  wait_days: Clock,
  wait_weeks: Clock
};

export default function SystemeWorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepModalType, setStepModalType] = useState<'action' | 'decision' | 'delay' | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedWorkflows = (data || []).map(workflow => ({
        ...workflow,
        nodes: (workflow.trigger_config as any)?.nodes || []
      }));
      
      setWorkflows(formattedWorkflows);
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workflow name',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert([{
          name: newWorkflow.name,
          description: newWorkflow.description,
          trigger_config: { nodes: [] },
      is_active: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Workflow created successfully'
      });

      setShowCreateDialog(false);
      setNewWorkflow({ name: '', description: '' });
      await fetchWorkflows();
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workflow',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
          .from('automation_workflows')
        .update({ is_active: isActive })
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Workflow ${isActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchWorkflows();
    } catch (error: any) {
      console.error('Error toggling workflow status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow status',
        variant: 'destructive'
      });
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Workflow deleted successfully'
      });

      fetchWorkflows();
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const handleStepSelect = (stepType: 'action' | 'decision' | 'delay', stepId: string) => {
    // This would add the step to the current workflow
    // For now, we'll just show a toast
    toast({
      title: 'Step Added',
      description: `${stepType} step "${stepId}" added to workflow`
    });
  };

  const openStepModal = (type: 'action' | 'decision' | 'delay') => {
    setStepModalType(type);
    setStepModalOpen(true);
  };

  const getStepIcon = (stepId: string) => {
    return STEP_ICONS[stepId] || Settings;
  };

  const getStepName = (stepId: string) => {
    return stepId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
            <p className="text-gray-500 mt-1">
              Create complex automation workflows with visual drag-and-drop
            </p>
      </div>

                    <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create workflow
                    </Button>
                  </div>
                </div>

      {/* Content */}
      <div className="p-6">
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-gray-400" />
              </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first workflow to get started with visual automation building
            </p>
                    <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
              <Plus className="w-4 h-4 mr-2" />
              Create your first workflow
                    </Button>
                </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-500">{workflow.description}</p>
              )}
            </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWorkflowStatus(workflow.id!, !workflow.is_active)}
                        className="flex items-center gap-1"
                      >
                        {workflow.is_active ? (
                          <>
                            <Pause className="h-3 w-3" />
                            Paused
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            Active
                          </>
                        )}
                      </Button>
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
              </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Workflow Preview */}
                  <div className="space-y-3">
                    {workflow.nodes.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Button
                          variant="outline"
                          onClick={() => openStepModal('action')}
                          className="border-dashed border-2 border-gray-300 hover:border-blue-400 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first trigger
                        </Button>
              </div>
            ) : (
                      <div className="space-y-2">
                        {workflow.nodes.slice(0, 3).map((node, index) => {
                          const Icon = getStepIcon(node.name);
                          return (
                            <div key={node.id} className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-100">
                                <Icon className="w-4 h-4 text-blue-600" />
        </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {getStepName(node.name)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {node.type}
                                </p>
      </div>
                              {index < workflow.nodes.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              )}
                        </div>
                      );
                    })}
                        {workflow.nodes.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{workflow.nodes.length - 3} more steps
                          </p>
                        )}
                  </div>
                    )}
          </div>
          
                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {workflow.nodes.length} steps
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {workflow.is_active ? 'Running' : 'Paused'}
                      </span>
                    </div>
              </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWorkflow(workflow)}
                      className="flex-1"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWorkflow(workflow.id!)}
                      className="px-3 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
              </div>
          </CardContent>
        </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="workflow-description">Description (Optional)</Label>
              <Input
                id="workflow-description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workflow description..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={createWorkflow}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Creating...' : 'Create Workflow'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step Selection Modal */}
      <StepSelectionModal
        isOpen={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        onSelectStep={handleStepSelect}
        stepType={stepModalType}
      />
    </div>
  );
}