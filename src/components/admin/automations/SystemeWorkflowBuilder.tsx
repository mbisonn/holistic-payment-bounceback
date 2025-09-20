import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Calendar,
  BarChart3,
  Target,
  Bot,
  Filter,
  MoreVertical,
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
  Save,
  X,
  MousePointer,
  FileText,
  Reply,
  UserPlus,
  LogIn,
  Truck,
  TrendingDown,
  DollarSign,
  UserMinus
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'start' | 'end';
  label: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
  data: any;
  connections: string[];
  isSelected?: boolean;
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}

interface WorkflowData {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  is_active: boolean;
  version: number;
}

const NODE_TYPES = {
  trigger: {
    name: 'Triggers',
    icon: Zap,
    color: 'blue',
    nodes: [
      { id: 'customer_signup', label: 'Customer Signup', icon: UserPlus, description: 'When a new customer signs up' },
      { id: 'purchase_paystack', label: 'Purchase (Paystack)', icon: CreditCard, description: 'When a purchase is made via Paystack' },
      { id: 'abandoned_cart', label: 'Cart Abandoned', icon: ShoppingCart, description: 'When a customer abandons their cart' },
      { id: 'email_opened', label: 'Email Opened', icon: Eye, description: 'When an email is opened' },
      { id: 'email_clicked', label: 'Email Clicked', icon: MousePointer, description: 'When a link in an email is clicked' },
      { id: 'page_visited', label: 'Page Visited', icon: Globe, description: 'When a specific page is visited' },
      { id: 'form_submitted', label: 'Form Submitted', icon: FileText, description: 'When a form is submitted' },
      { id: 'birthday', label: 'Customer Birthday', icon: Gift, description: 'On a customer\'s birthday' },
    ]
  },
  action: {
    name: 'Actions',
    icon: Settings,
    color: 'green',
    nodes: [
      { id: 'send_email', label: 'Send Email', icon: Send, description: 'Send an email to the customer' },
      { id: 'send_sms', label: 'Send SMS', icon: MessageSquare, description: 'Send an SMS to the customer' },
      { id: 'assign_tag', label: 'Assign Tag', icon: Tag, description: 'Assign a tag to the customer' },
      { id: 'create_task', label: 'Create Task', icon: CheckCircle, description: 'Create a task for the team' },
      { id: 'webhook', label: 'Call Webhook', icon: Webhook, description: 'Call an external webhook' },
      { id: 'add_note', label: 'Add Note', icon: FileText, description: 'Add a note to the customer' },
      { id: 'update_customer', label: 'Update Customer', icon: Edit, description: 'Update customer information' },
      { id: 'create_deal', label: 'Create Deal', icon: DollarSign, description: 'Create a new deal' },
    ]
  },
  condition: {
    name: 'Conditions',
    icon: Filter,
    color: 'yellow',
    nodes: [
      { id: 'has_tag', label: 'Has Tag', icon: Tag, description: 'Check if customer has a specific tag' },
      { id: 'purchase_value', label: 'Purchase Value', icon: DollarSign, description: 'Check purchase value' },
      { id: 'customer_segment', label: 'Customer Segment', icon: Users, description: 'Check customer segment' },
      { id: 'time_of_day', label: 'Time of Day', icon: Clock, description: 'Check time of day' },
      { id: 'day_of_week', label: 'Day of Week', icon: Calendar, description: 'Check day of week' },
      { id: 'email_opened', label: 'Email Opened', icon: Eye, description: 'Check if email was opened' },
      { id: 'custom_field', label: 'Custom Field', icon: Settings2, description: 'Check custom field value' },
    ]
  },
  delay: {
    name: 'Delays',
    icon: Clock,
    color: 'purple',
    nodes: [
      { id: 'wait_minutes', label: 'Wait Minutes', icon: Clock, description: 'Wait for specified minutes' },
      { id: 'wait_hours', label: 'Wait Hours', icon: Clock, description: 'Wait for specified hours' },
      { id: 'wait_days', label: 'Wait Days', icon: Calendar, description: 'Wait for specified days' },
      { id: 'wait_weeks', label: 'Wait Weeks', icon: Calendar, description: 'Wait for specified weeks' },
      { id: 'wait_until_time', label: 'Wait Until Time', icon: Clock, description: 'Wait until specific time' },
      { id: 'wait_until_date', label: 'Wait Until Date', icon: Calendar, description: 'Wait until specific date' },
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
      { id: 'trigger1', type: 'trigger', label: 'Customer Signup', position: { x: 300, y: 100 }, data: { trigger: 'customer_signup' }, connections: ['delay1'] },
      { id: 'delay1', type: 'delay', label: 'Wait 1 Hour', position: { x: 500, y: 100 }, data: { delay: 60 }, connections: ['action1'] },
      { id: 'action1', type: 'action', label: 'Send Welcome Email', position: { x: 700, y: 100 }, data: { action: 'send_email' }, connections: ['delay2'] },
      { id: 'delay2', type: 'delay', label: 'Wait 1 Day', position: { x: 900, y: 100 }, data: { delay: 1440 }, connections: ['action2'] },
      { id: 'action2', type: 'action', label: 'Send Follow-up', position: { x: 1100, y: 100 }, data: { action: 'send_email' }, connections: ['end'] },
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
    id: 'abandoned_cart',
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned carts with targeted emails',
    icon: '🛒',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 100 }, data: {}, connections: ['trigger1'] },
      { id: 'trigger1', type: 'trigger', label: 'Cart Abandoned', position: { x: 300, y: 100 }, data: { trigger: 'abandoned_cart' }, connections: ['delay1'] },
      { id: 'delay1', type: 'delay', label: 'Wait 1 Hour', position: { x: 500, y: 100 }, data: { delay: 60 }, connections: ['action1'] },
      { id: 'action1', type: 'action', label: 'Send Reminder Email', position: { x: 700, y: 100 }, data: { action: 'send_email' }, connections: ['delay2'] },
      { id: 'delay2', type: 'delay', label: 'Wait 24 Hours', position: { x: 900, y: 100 }, data: { delay: 1440 }, connections: ['condition1'] },
      { id: 'condition1', type: 'condition', label: 'Still Abandoned?', position: { x: 1100, y: 100 }, data: { condition: 'has_tag' }, connections: ['action2', 'end'] },
      { id: 'action2', type: 'action', label: 'Send Discount Email', position: { x: 1100, y: 250 }, data: { action: 'send_email' }, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', position: { x: 1300, y: 100 }, data: {}, connections: [] },
    ],
    connections: [
      { id: 'c1', source: 'start', target: 'trigger1' },
      { id: 'c2', source: 'trigger1', target: 'delay1' },
      { id: 'c3', source: 'delay1', target: 'action1' },
      { id: 'c4', source: 'action1', target: 'delay2' },
      { id: 'c5', source: 'delay2', target: 'condition1' },
      { id: 'c6', source: 'condition1', target: 'action2', label: 'Yes' },
      { id: 'c7', source: 'condition1', target: 'end', label: 'No' },
      { id: 'c8', source: 'action2', target: 'end' },
    ]
  }
];

export default function SystemeWorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { toast } = useToast();

  // Initialize with start and end nodes
  useEffect(() => {
    const startNode: WorkflowNode = {
      id: 'start',
      type: 'start',
      label: 'Start',
      description: 'Workflow start point',
      icon: '▶️',
      position: { x: 100, y: 200 },
      data: {},
      connections: []
    };
    
    const endNode: WorkflowNode = {
      id: 'end',
      type: 'end',
      label: 'End',
      description: 'Workflow end point',
      icon: '🏁',
      position: { x: 1200, y: 200 },
      data: {},
      connections: []
    };
    
    setNodes([startNode, endNode]);
  }, []);

  const addNode = (nodeType: string, nodeData: any) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType as any,
      label: nodeData.label,
      description: nodeData.description,
      icon: nodeData.icon,
      position: { x: 400 + Math.random() * 200, y: 200 + Math.random() * 100 },
      data: nodeData,
      connections: []
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
  };

  const startConnection = (nodeId: string) => {
    setIsConnecting(true);
    setConnectionSource(nodeId);
  };

  const completeConnection = (nodeId: string) => {
    if (isConnecting && connectionSource && connectionSource !== nodeId) {
      const newConnection: WorkflowConnection = {
        id: `conn_${Date.now()}`,
        source: connectionSource,
        target: nodeId,
        animated: true
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectionSource(null);
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const loadTemplate = (template: any) => {
    setNodes(template.nodes);
    setConnections(template.connections);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setShowTemplates(false);
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workflow name',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const workflowData: WorkflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        connections,
        is_active: true,
        version: 1
      };

      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          name: workflowName,
          description: workflowDescription,
          trigger: 'workflow',
          action: 'execute_workflow',
          trigger_data: JSON.stringify(workflowData),
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Workflow saved successfully'
      });

    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNodeDrag = (nodeId: string, deltaX: number, deltaY: number) => {
    updateNode(nodeId, {
      position: {
        x: Math.max(0, Math.min(1400, nodes.find(n => n.id === nodeId)!.position.x + deltaX)),
        y: Math.max(0, Math.min(600, nodes.find(n => n.id === nodeId)!.position.y + deltaY))
      }
    });
  };

  const getNodeIcon = (node: WorkflowNode) => {
    const nodeType = NODE_TYPES[node.type as keyof typeof NODE_TYPES];
    if (nodeType) {
      const nodeData = nodeType.nodes.find(n => n.id === node.data?.trigger || n.id === node.data?.action || n.id === node.data?.condition || n.id === node.data?.delay);
      return nodeData?.icon || '⚙️';
    }
    return '⚙️';
  };

  const getNodeColor = (node: WorkflowNode) => {
    const colors = {
      start: 'bg-green-500',
      end: 'bg-red-500',
      trigger: 'bg-blue-500',
      action: 'bg-green-500',
      condition: 'bg-yellow-500',
      delay: 'bg-purple-500'
    };
    return colors[node.type] || 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Workflow name..."
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="glass-input text-white border-white/20 w-64"
          />
          <Input
            placeholder="Description..."
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            className="glass-input text-white border-white/20 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowTemplates(true)} variant="outline" className="glass-button-outline">
            <Plus className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={saveWorkflow} disabled={saving} className="glass-button">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/20 p-4 overflow-y-auto">
          <div className="space-y-4">
            {Object.entries(NODE_TYPES).map(([typeKey, typeData]) => (
              <Card key={typeKey} className="glass-card border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <typeData.icon className="h-4 w-4" />
                    {typeData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {typeData.nodes.map((nodeData) => (
                    <div
                      key={nodeData.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedNode({ ...nodeData, type: typeKey });
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="p-2 rounded cursor-move hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span>{nodeData.icon}</span>
                        <span className="text-white">{nodeData.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">{nodeData.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="w-full h-full relative"
            onDrop={(e) => {
              e.preventDefault();
              if (draggedNode) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                addNode(draggedNode.type, {
                  ...draggedNode,
                  position: { x, y }
                });
                setDraggedNode(null);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Connections */}
            <svg className="absolute inset-0 pointer-events-none">
              {connections.map((connection) => {
                const sourceNode = nodes.find(n => n.id === connection.source);
                const targetNode = nodes.find(n => n.id === connection.target);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.position.x + 50;
                const startY = sourceNode.position.y + 25;
                const endX = targetNode.position.x;
                const endY = targetNode.position.y + 25;

                return (
                  <g key={connection.id}>
                    <path
                      d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 50} ${endX} ${endY}`}
                      stroke={connection.animated ? "#10b981" : "#6b7280"}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={connection.animated ? "5,5" : "none"}
                    />
                    {connection.label && (
                      <text
                        x={(startX + endX) / 2}
                        y={startY - 60}
                        textAnchor="middle"
                        className="text-xs fill-white"
                      >
                        {connection.label}
                      </text>
                    )}
                    <circle
                      cx={endX}
                      cy={endY}
                      r="4"
                      fill={connection.animated ? "#10b981" : "#6b7280"}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute w-24 h-12 rounded-lg border-2 cursor-move select-none ${
                  getNodeColor(node)
                } ${
                  selectedNode?.id === node.id ? 'ring-2 ring-blue-400' : ''
                } ${
                  isConnecting && connectionSource === node.id ? 'ring-2 ring-yellow-400' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                }}
                onClick={() => setSelectedNode(node)}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    const deltaX = e.clientX - dragStart.x;
                    const deltaY = e.clientY - dragStart.y;
                    handleNodeDrag(node.id, deltaX, deltaY);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                  <span className="mr-1">{getNodeIcon(node)}</span>
                  <span className="truncate">{node.label}</span>
                </div>
                
                {/* Connection handles */}
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(node.id);
                    }}
                    className="w-4 h-4 bg-blue-500 rounded-full hover:bg-blue-400 transition-colors"
                  >
                    <Plus className="h-2 w-2 text-white mx-auto" />
                  </button>
                </div>
                
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeConnection(node.id);
                    }}
                    className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-400 transition-colors"
                  >
                    <ArrowRight className="h-2 w-2 text-white mx-auto" />
                  </button>
                </div>
              </div>
            ))}

            {/* Connection mode indicator */}
            {isConnecting && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium">
                Click on a node to connect
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKFLOW_TEMPLATES.map(template => (
              <Card key={template.id} className="glass-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{template.icon}</div>
                    <Badge variant="secondary">Template</Badge>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                  <div className="text-xs text-gray-400 mb-4">
                    {template.nodes.length} nodes, {template.connections.length} connections
                  </div>
                  <Button 
                    onClick={() => loadTemplate(template)}
                    className="w-full glass-button"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Configuration Dialog */}
      {selectedNode && (
        <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent className="glass-card border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Configure {selectedNode.label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Label</Label>
                <Input
                  value={selectedNode.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={selectedNode.description}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div className="flex justify-between">
                <Button 
                  onClick={() => deleteNode(selectedNode.id)}
                  variant="destructive"
                  className="glass-button-outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={() => setSelectedNode(null)} className="glass-button">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
