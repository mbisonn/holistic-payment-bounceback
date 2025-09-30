import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed unused Badge import
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Save, 
  Settings, 
  Mail, 
  Clock,
  Tag,
  MessageSquare,
  CreditCard,
  Gift,
  CheckCircle,
  Database,
  Send,
  XCircle,
  ShoppingCart,
  Calendar,
  User, 
  Zap,
  X,
  Trash2,
  Eye,
  Target,
  Filter
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

const NODE_TYPES = {
  trigger: {
    name: 'Triggers',
    icon: Zap,
    color: 'blue',
    nodes: [
      { id: 'customer_signup', label: 'Customer Signup', icon: User, description: 'When a new customer signs up' },
      { id: 'purchase_paystack', label: 'Purchase (Paystack)', icon: CreditCard, description: 'When a purchase is made via Paystack' },
      { id: 'abandoned_cart', label: 'Cart Abandoned', icon: CreditCard, description: 'When a customer abandons their cart' },
      { id: 'email_opened', label: 'Email Opened', icon: Eye, description: 'When an email is opened' },
      { id: 'email_clicked', label: 'Email Clicked', icon: Target, description: 'When an email link is clicked' },
      { id: 'birthday', label: 'Customer Birthday', icon: Gift, description: 'On a customer\'s birthday' },
      { id: 'order_delivered', label: 'Order Delivered', icon: CheckCircle, description: 'When an order is delivered' },
      { id: 'payment_failed', label: 'Payment Failed', icon: XCircle, description: 'When a payment fails' },
    ]
  },
  action: {
    name: 'Actions',
    icon: Settings,
    color: 'green',
    nodes: [
      { id: 'send_email', label: 'Send Email', icon: Send, description: 'Send an email to the customer' },
      { id: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageSquare, description: 'Send a WhatsApp message' },
      { id: 'send_email_campaign', label: 'Send Email Campaign', icon: Mail, description: 'Send an email campaign' },
      { id: 'send_sms', label: 'Send SMS', icon: MessageSquare, description: 'Send an SMS to the customer' },
      { id: 'assign_tag', label: 'Assign Tag', icon: Tag, description: 'Assign a tag to the customer' },
      { id: 'remove_tag', label: 'Remove Tag', icon: XCircle, description: 'Remove a tag from the customer' },
      { id: 'create_task', label: 'Create Task', icon: CheckCircle, description: 'Create a task for the team' },
      { id: 'webhook', label: 'Call Webhook', icon: Database, description: 'Call an external webhook' },
      { id: 'update_customer', label: 'Update Customer', icon: User, description: 'Update customer information' },
    ]
  },
  condition: {
    name: 'Conditions',
    icon: Filter,
    color: 'yellow',
    nodes: [
      { id: 'has_tag', label: 'Has Tag', icon: Tag, description: 'Check if customer has a specific tag' },
      { id: 'purchase_value', label: 'Purchase Value', icon: Target, description: 'Check purchase value' },
      { id: 'time_of_day', label: 'Time of Day', icon: Clock, description: 'Check time of day' },
      { id: 'customer_segment', label: 'Customer Segment', icon: User, description: 'Check customer segment' },
      { id: 'order_count', label: 'Order Count', icon: CheckCircle, description: 'Check number of orders' },
    ]
  },
  delay: {
    name: 'Delays',
    icon: Clock,
    color: 'purple',
    nodes: [
      { id: 'wait_minutes', label: 'Wait Minutes', icon: Clock, description: 'Wait for specified minutes' },
      { id: 'wait_hours', label: 'Wait Hours', icon: Clock, description: 'Wait for specified hours' },
      { id: 'wait_days', label: 'Wait Days', icon: Clock, description: 'Wait for specified days' },
      { id: 'wait_until', label: 'Wait Until', icon: Clock, description: 'Wait until specific time' },
    ]
  }
};

const WORKFLOW_TEMPLATES = [
  {
    id: 'welcome_series',
    name: 'Welcome Series',
    description: 'Complete welcome series for new customers',
    icon: '👋',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 100 }, data: {}, connections: ['trigger1'] },
      { id: 'trigger1', type: 'trigger', label: 'Customer Signup', position: { x: 300, y: 100 }, data: { trigger: 'customer_signup' }, connections: ['action1'] },
      { id: 'action1', type: 'action', label: 'Send Welcome Email', position: { x: 500, y: 100 }, data: { action: 'send_email' }, connections: ['delay1'] },
      { id: 'delay1', type: 'delay', label: 'Wait 1 Day', position: { x: 700, y: 100 }, data: { delay: 'wait_days', value: 1 }, connections: ['action2'] },
      { id: 'action2', type: 'action', label: 'Send Follow-up', position: { x: 900, y: 100 }, data: { action: 'send_email' }, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', position: { x: 1100, y: 100 }, data: {}, connections: [] },
    ],
    connections: [
      { id: 'c1', source: 'start', target: 'trigger1' },
      { id: 'c2', source: 'trigger1', target: 'action1' },
      { id: 'c3', source: 'action1', target: 'delay1' },
      { id: 'c4', source: 'delay1', target: 'action2' },
      { id: 'c5', source: 'action2', target: 'end' },
    ]
  },
  {
    id: 'abandoned_cart_recovery',
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned carts with targeted emails',
    icon: '🛒',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 100 }, data: {}, connections: ['trigger1'] },
      { id: 'trigger1', type: 'trigger', label: 'Cart Abandoned', position: { x: 300, y: 100 }, data: { trigger: 'abandoned_cart' }, connections: ['delay1'] },
      { id: 'delay1', type: 'delay', label: 'Wait 1 Hour', position: { x: 500, y: 100 }, data: { delay: 'wait_hours', value: 1 }, connections: ['action1'] },
      { id: 'action1', type: 'action', label: 'Send Recovery Email', position: { x: 700, y: 100 }, data: { action: 'send_email' }, connections: ['delay2'] },
      { id: 'delay2', type: 'delay', label: 'Wait 24 Hours', position: { x: 900, y: 100 }, data: { delay: 'wait_hours', value: 24 }, connections: ['action2'] },
      { id: 'action2', type: 'action', label: 'Send Final Email', position: { x: 1100, y: 100 }, data: { action: 'send_email' }, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', position: { x: 1300, y: 100 }, data: {}, connections: [] },
    ],
    connections: [
      { id: 'c1', source: 'start', target: 'trigger1' },
      { id: 'c2', source: 'trigger1', target: 'delay1' },
      { id: 'c3', source: 'delay1', target: 'action1' },
      { id: 'c4', source: 'action1', target: 'delay2' },
      { id: 'c5', source: 'delay2', target: 'action2' },
      { id: 'c6', source: 'action2', target: 'end' },
    ]
  },
  {
    id: 'post_purchase_sequence',
    name: 'Post-Purchase Sequence',
    description: 'Follow up after successful purchase',
    icon: '🎉',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 100 }, data: {}, connections: ['trigger1'] },
      { id: 'trigger1', type: 'trigger', label: 'Purchase Complete', position: { x: 300, y: 100 }, data: { trigger: 'purchase_paystack' }, connections: ['action1'] },
      { id: 'action1', type: 'action', label: 'Send Thank You', position: { x: 500, y: 100 }, data: { action: 'send_email' }, connections: ['delay1'] },
      { id: 'delay1', type: 'delay', label: 'Wait 3 Days', position: { x: 700, y: 100 }, data: { delay: 'wait_days', value: 3 }, connections: ['action2'] },
      { id: 'action2', type: 'action', label: 'Request Review', position: { x: 900, y: 100 }, data: { action: 'send_email' }, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', position: { x: 1100, y: 100 }, data: {}, connections: [] },
    ],
    connections: [
      { id: 'c1', source: 'start', target: 'trigger1' },
      { id: 'c2', source: 'trigger1', target: 'action1' },
      { id: 'c3', source: 'action1', target: 'delay1' },
      { id: 'c4', source: 'delay1', target: 'action2' },
      { id: 'c5', source: 'action2', target: 'end' },
    ]
  }
];
export default function SystemeWorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
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

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      name: 'New Workflow',
      description: '',
      nodes: [],
      is_active: false
    };
    setSelectedWorkflow(newWorkflow);
    setIsEditing(true);
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const workflowData = {
        name: selectedWorkflow.name,
        description: selectedWorkflow.description,
        trigger_type: (selectedWorkflow.nodes || []).find(n => n.type === 'trigger')?.name || 'manual',
        trigger_config: JSON.stringify({ nodes: selectedWorkflow.nodes || [] }),
        is_active: selectedWorkflow.is_active
      };

      if (selectedWorkflow.id) {
      const { error } = await supabase
          .from('automation_workflows')
          .update(workflowData)
          .eq('id', selectedWorkflow.id);
        if (error) throw error;
      } else {
        const { data: insertData, error } = await supabase
          .from('automation_workflows')
          .insert([workflowData])
          .select()
          .single();
      if (error) throw error;
        setSelectedWorkflow({ ...selectedWorkflow, id: insertData.id });
      }

      toast({
        title: 'Success',
        description: 'Workflow saved successfully'
      });

      fetchWorkflows();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
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
      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null);
      }
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const addNode = (nodeType: any, position: { x: number; y: number }) => {
    if (!selectedWorkflow) return;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType.type,
      name: nodeType.name,
      config: {},
      position,
      connections: []
    };

    setSelectedWorkflow({
      ...selectedWorkflow,
      nodes: [...(selectedWorkflow.nodes || []), newNode]
    });
    setIsEditing(true);
  };

  const deleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;

    setSelectedWorkflow({
      ...selectedWorkflow,
      nodes: (selectedWorkflow.nodes || []).filter(node => node.id !== nodeId)
    });
    setIsEditing(true);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    addNode(draggedNodeType, position);
    setDraggedNodeType(null);
  };

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
          <h2 className="text-2xl font-bold text-white">Workflow Builder</h2>
          <p className="text-gray-400">Create multi-step automation workflows</p>
        </div>
        <Button onClick={createNewWorkflow} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow List */}
        <Card className="lg:col-span-1 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Workflows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{workflow.name}</h3>
                    <p className="text-sm text-gray-400">{workflow.nodes.length} steps</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.is_active ? "default" : "secondary"}>
                      {workflow.is_active ? 'Active' : 'Draft'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkflow(workflow.id!);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

        {/* Canvas */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {selectedWorkflow ? selectedWorkflow.name : 'Select a workflow'}
              </CardTitle>
              {selectedWorkflow && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNodePalette(!showNodePalette)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Node
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={saveWorkflow}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedWorkflow ? (
              <div
                ref={canvasRef}
                className="relative h-96 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 overflow-auto"
                onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
          >
                {(selectedWorkflow.nodes || []).map((node, index) => (
              <div
                key={node.id}
                    className="absolute bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-purple-500"
                style={{
                      left: node.position.x || index * 150 + 50,
                      top: node.position.y || 50
                }}
                onClick={() => setSelectedNode(node)}
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const group = NODE_TYPES[node.type as keyof typeof NODE_TYPES] as any;
                        const list = Array.isArray(group) ? group : group?.nodes;
                        const match = Array.isArray(list) ? list.find((t: any) => t.name === node.name) : undefined;
                        return match?.icon;
                      })() && (
                        <div className="text-white">
                          {(() => {
                            const group = NODE_TYPES[node.type as keyof typeof NODE_TYPES] as any;
                            const list = Array.isArray(group) ? group : group?.nodes;
                            const match = Array.isArray(list) ? list.find((t: any) => t.name === node.name) : undefined;
                            return match?.icon ? React.createElement(match.icon, { className: "w-4 h-4" }) : null;
                          })()}
                </div>
                      )}
                      <span className="text-white text-sm">{node.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 h-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
              </div>
            ))}
                
                {(selectedWorkflow.nodes || []).length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-2" />
                      <p>Drag nodes here to build your workflow</p>
          </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <Settings className="w-12 h-12 mx-auto mb-2" />
                  <p>Select a workflow to edit or create a new one</p>
        </div>
      </div>
            )}
          </CardContent>
        </Card>

        {/* Node Palette */}
        <Card className="lg:col-span-1 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Node Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(NODE_TYPES).map(([type, nodes]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">{type}s</h4>
                <div className="space-y-2">
                  {(Array.isArray(nodes) ? nodes : (nodes as any)?.nodes || []).map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg cursor-move hover:bg-gray-600"
                        draggable
                        onDragStart={() => setDraggedNodeType({ ...node, type })}
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{node.name}</span>
                    </div>
                    );
                  })}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
          </div>
          
      {/* Node Configuration Panel */}
      {selectedNode && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Configure: {selectedNode.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode.type === 'action' && selectedNode.name === 'Send Email' && (
              <div className="space-y-4">
            <div>
                  <Label className="text-white">Email Template</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select email template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="rating">Rating Request</SelectItem>
                    </SelectContent>
                  </Select>
            </div>
            </div>
            )}
            
            {selectedNode.type === 'delay' && (
              <div className="space-y-4">
            <div>
                  <Label className="text-white">Delay Duration</Label>
                  <div className="flex gap-2">
              <Input
                      type="number" 
                      placeholder="1" 
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
            </div>
          </div>
        </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}