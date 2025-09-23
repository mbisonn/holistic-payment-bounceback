import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Settings, 
  Zap, 
  User, 
  Target,
  Filter,
  Eye,
  Trash2,
  Clock,
  Tag,
  MessageSquare,
  CreditCard,
  Gift,
  CheckCircle,
  Database,
  Send,
  Save,
  ShoppingCart,
  Calendar
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
      { id: 'customer_signup', label: 'Customer Signup', icon: User, description: 'When a new customer signs up' },
      { id: 'purchase_paystack', label: 'Purchase (Paystack)', icon: CreditCard, description: 'When a purchase is made via Paystack' },
      { id: 'abandoned_cart', label: 'Cart Abandoned', icon: ShoppingCart, description: 'When a customer abandons their cart' },
      { id: 'email_opened', label: 'Email Opened', icon: Eye, description: 'When an email is opened' },
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
      { id: 'webhook', label: 'Call Webhook', icon: Database, description: 'Call an external webhook' },
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
      { id: 'action1', type: 'action', label: 'Send Welcome Email', position: { x: 500, y: 100 }, data: { action: 'send_email' }, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', position: { x: 700, y: 100 }, data: {}, connections: [] },
    ],
    connections: [
      { id: 'c1', source: 'start', target: 'trigger1' },
      { id: 'c2', source: 'trigger1', target: 'action1' },
      { id: 'c3', source: 'action1', target: 'end' },
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
            className="bounce-back-consult-input text-white border-white/20 w-64"
          />
          <Input
            placeholder="Description..."
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            className="bounce-back-consult-input text-white border-white/20 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowTemplates(true)} variant="outline" className="bounce-back-consult-button-outline">
            <Plus className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={saveWorkflow} disabled={saving} className="bounce-back-consult-button">
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
              <Card key={typeKey} className="bounce-back-consult-card border-white/20">
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
                        <nodeData.icon className="h-4 w-4 text-white" />
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
            className="w-full h-full relative bg-gray-800"
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
            {/* Grid background */}
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
                
                const x1 = sourceNode.position.x + 60;
                const y1 = sourceNode.position.y + 20;
                const x2 = targetNode.position.x;
                const y2 = targetNode.position.y + 20;
                
                const midX = (x1 + x2) / 2;
                
                return (
                  <path
                    key={connection.id}
                    d={`M ${x1} ${y1} C ${midX} ${y1} ${midX} ${y2} ${x2} ${y2}`}
                    stroke="rgba(99, 102, 241, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="rgba(99, 102, 241, 0.6)"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute w-32 h-12 rounded-lg border-2 cursor-move transition-colors ${
                  getNodeColor(node)
                } ${
                  selectedNode?.id === node.id ? 'border-white' : 'border-gray-400'
                } hover:border-white`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                }}
                onClick={() => setSelectedNode(node)}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
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
              >
                <div className="flex items-center justify-center h-full text-white text-xs font-medium px-2 text-center">
                  {node.label}
                </div>
                
                {/* Connection handles */}
                {node.type !== 'end' && (
                  <div
                    className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 cursor-pointer hover:bg-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(node.id);
                    }}
                  />
                )}
                
                {node.type !== 'start' && (
                  <div
                    className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 cursor-pointer hover:bg-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeConnection(node.id);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">Choose from pre-built workflow templates:</p>
            <div className="space-y-3">
              {WORKFLOW_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-white/20 hover:border-white/30 transition-colors cursor-pointer"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="fixed right-4 top-20 w-80 bounce-back-consult-card border-white/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Node Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-white">Type:</span>
              <p className="text-gray-300 capitalize">{selectedNode.type}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-white">Label:</span>
              <Input
                value={selectedNode.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="bounce-back-consult-input text-white border-white/20 mt-1"
              />
            </div>
            
            <div>
              <span className="text-sm font-medium text-white">Description:</span>
              <Input
                value={selectedNode.description}
                onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                className="bounce-back-consult-input text-white border-white/20 mt-1"
              />
            </div>
            
            {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
              <Button
                onClick={() => deleteNode(selectedNode.id)}
                variant="outline"
                size="sm"
                className="w-full text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}