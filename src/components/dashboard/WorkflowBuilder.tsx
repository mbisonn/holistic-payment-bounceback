import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Mail, Tag, Plus, 
  ArrowRight, Play, Pause, Save, X,
  UserPlus, UserMinus, Clock, CheckCircle,
  MessageSquare,
  ShoppingCart, Calendar, TrendingUp, TrendingDown,
  ShoppingBag, Package, DollarSign, CreditCard,
  Bell, User, Link, MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  description: string;
  icon: React.ElementType;
  position: { x: number; y: number };
  data: any;
  connections: string[];
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
}

interface WorkflowElement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'triggers' | 'actions' | 'conditions' | 'delays';
}

const WORKFLOW_ELEMENTS: WorkflowElement[] = [
  // Triggers
  { id: 'new_contact', title: 'New Contact', description: 'When a new contact is added', icon: UserPlus, category: 'triggers' },
  { id: 'purchase', title: 'Purchase', description: 'When a purchase is made', icon: CheckCircle, category: 'triggers' },
  { id: 'email_opened', title: 'Email Opened', description: 'When an email is opened', icon: Mail, category: 'triggers' },
  { id: 'link_clicked', title: 'Link Clicked', description: 'When a link is clicked', icon: ArrowRight, category: 'triggers' },
  { id: 'purchase_paystack', title: 'Paystack Purchase', description: 'When a Paystack payment is completed', icon: CheckCircle, category: 'triggers' },
  { id: 'payment_on_delivery', title: 'Payment on Delivery', description: 'When payment on delivery is made', icon: CheckCircle, category: 'triggers' },
  { id: 'upsell_purchase', title: 'Upsell Purchase', description: 'When an upsell is purchased', icon: TrendingUp, category: 'triggers' },
  { id: 'downsell_purchase', title: 'Downsell Purchase', description: 'When a downsell is purchased', icon: TrendingDown, category: 'triggers' },
  { id: 'abandoned_cart', title: 'Abandoned Cart', description: 'When a cart is abandoned', icon: ShoppingCart, category: 'triggers' },
  { id: 'meal_plan_signup', title: 'Meal Plan Signup', description: 'When someone signs up for meal plan', icon: Calendar, category: 'triggers' },
  { id: 'order_bump_purchase', title: 'Order Bump Purchase', description: 'When an order bump is purchased', icon: Plus, category: 'triggers' },
  { id: 'tag_added', title: 'Tag Added', description: 'When a tag is added to contact', icon: Tag, category: 'triggers' },
  { id: 'tag_removed', title: 'Tag Removed', description: 'When a tag is removed from contact', icon: Tag, category: 'triggers' },
  
  // Actions
  { id: 'send_email', title: 'Send Email', description: 'Send an email campaign', icon: Mail, category: 'actions' },
  { id: 'send_sms', title: 'Send SMS', description: 'Send an SMS message', icon: MessageSquare, category: 'actions' },
  { id: 'add_tag', title: 'Add Tag', description: 'Add a tag to contact', icon: Tag, category: 'actions' },
  { id: 'remove_tag', title: 'Remove Tag', description: 'Remove a tag from contact', icon: UserMinus, category: 'actions' },
  { id: 'assign_user', title: 'Assign to User', description: 'Assign contact to a user', icon: Users, category: 'actions' },
  { id: 'add_to_list', title: 'Add to List', description: 'Add contact to a list', icon: Plus, category: 'actions' },
  { id: 'remove_from_list', title: 'Remove from List', description: 'Remove contact from list', icon: UserMinus, category: 'actions' },
  { id: 'assign_tag', title: 'Assign Tag', description: 'Assign a specific tag to contact', icon: Tag, category: 'actions' },
  { id: 'send_email_campaign', title: 'Send Email Campaign', description: 'Send a specific email campaign', icon: Mail, category: 'actions' },
  { id: 'create_order', title: 'Create Order', description: 'Create a new order', icon: ShoppingBag, category: 'actions' },
  { id: 'update_order_status', title: 'Update Order Status', description: 'Update order status', icon: Package, category: 'actions' },
  { id: 'send_notification', title: 'Send Notification', description: 'Send push notification', icon: Bell, category: 'actions' },
  { id: 'create_customer', title: 'Create Customer', description: 'Create new customer record', icon: UserPlus, category: 'actions' },
  { id: 'update_customer', title: 'Update Customer', description: 'Update customer information', icon: User, category: 'actions' },
  { id: 'apply_discount', title: 'Apply Discount', description: 'Apply discount code', icon: Tag, category: 'actions' },
  { id: 'generate_payment_link', title: 'Generate Payment Link', description: 'Generate Paystack payment link', icon: Link, category: 'actions' },
  
  // Conditions
  { id: 'if_tag', title: 'If Has Tag', description: 'Check if contact has tag', icon: Tag, category: 'conditions' },
  { id: 'if_purchased', title: 'If Purchased', description: 'Check if contact purchased', icon: CheckCircle, category: 'conditions' },
  { id: 'if_email_opened', title: 'If Email Opened', description: 'Check if email was opened', icon: Mail, category: 'conditions' },
  { id: 'if_order_value', title: 'If Order Value', description: 'Check order total value', icon: DollarSign, category: 'conditions' },
  { id: 'if_customer_type', title: 'If Customer Type', description: 'Check customer type/segment', icon: Users, category: 'conditions' },
  { id: 'if_product_purchased', title: 'If Product Purchased', description: 'Check if specific product purchased', icon: Package, category: 'conditions' },
  { id: 'if_order_status', title: 'If Order Status', description: 'Check order status', icon: Package, category: 'conditions' },
  { id: 'if_payment_method', title: 'If Payment Method', description: 'Check payment method used', icon: CreditCard, category: 'conditions' },
  { id: 'if_location', title: 'If Location', description: 'Check customer location', icon: MapPin, category: 'conditions' },
  { id: 'if_time_of_day', title: 'If Time of Day', description: 'Check time of day', icon: Clock, category: 'conditions' },
  { id: 'if_day_of_week', title: 'If Day of Week', description: 'Check day of week', icon: Calendar, category: 'conditions' },
  
  // Delays
  { id: 'wait', title: 'Wait', description: 'Wait for specified time', icon: Clock, category: 'delays' },
  { id: 'wait_days', title: 'Wait Days', description: 'Wait for specific number of days', icon: Calendar, category: 'delays' },
  { id: 'wait_hours', title: 'Wait Hours', description: 'Wait for specific number of hours', icon: Clock, category: 'delays' },
  { id: 'wait_until_time', title: 'Wait Until Time', description: 'Wait until specific time', icon: Clock, category: 'delays' },
  { id: 'wait_until_date', title: 'Wait Until Date', description: 'Wait until specific date', icon: Calendar, category: 'delays' },
];

const WorkflowBuilder: React.FC = () => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'active' | 'paused'>('draft');
  const [emailCampaigns, setEmailCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmailCampaigns();
    fetchTags();
  }, []);

  const fetchEmailCampaigns = async () => {
    const { data } = await supabase
      .from('email_campaigns')
      .select('id, name')
      .eq('is_active', true);
    setEmailCampaigns(data || []);
  };

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('id, name');
    setTags(data || []);
  };

  const addNode = (element: WorkflowElement, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `${element.id}_${Date.now()}`,
      type: element.category === 'triggers' ? 'trigger' : 
            element.category === 'actions' ? 'action' : 
            element.category === 'conditions' ? 'condition' : 'delay',
      title: element.title,
      description: element.description,
      icon: element.icon,
      position,
      data: {},
      connections: []
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      source: sourceId,
      target: targetId
    };
    setConnections(prev => [...prev, newConnection]);
    
    // Update source node connections
    setNodes(prev => prev.map(node => 
      node.id === sourceId 
        ? { ...node, connections: [...node.connections, targetId] }
        : node
    ));
  };

  const startConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const completeConnection = (targetNodeId: string) => {
    if (connectingFrom && connectingFrom !== targetNodeId) {
      connectNodes(connectingFrom, targetNodeId);
    }
    setConnectingFrom(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
    }
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const handleDragStart = (e: React.DragEvent, element: WorkflowElement) => {
    e.dataTransfer.setData('application/json', JSON.stringify(element));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const element = JSON.parse(e.dataTransfer.getData('application/json')) as WorkflowElement;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      addNode(element, position);
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({ title: 'Error', description: 'Please enter a workflow name', variant: 'destructive' });
      return;
    }

    try {
      const workflowData = {
        name: workflowName,
        nodes: nodes,
        connections: connections,
        status: workflowStatus,
        is_active: workflowStatus === 'active'
      };

      const { data: workflow, error: workflowError } = await supabase
        .from('automation_workflows')
        .insert([{
          name: workflowName,
          description: '',
          trigger_type: 'manual',
          trigger_config: workflowData as any,
          is_active: workflowStatus === 'active'
        }])
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Save nodes
      if (workflow && nodes.length > 0) {
        const nodeInserts = nodes.map(node => ({
          workflow_id: workflow.id,
          node_id: node.id,
          node_type: node.type,
          position_x: node.position.x,
          position_y: node.position.y,
          config: node.data
        }));

        const { error: nodesError } = await supabase
          .from('workflow_nodes')
          .insert(nodeInserts);

        if (nodesError) console.error('Error saving nodes:', nodesError);
      }

      // Save connections
      if (workflow && connections.length > 0) {
        const connectionInserts = connections.map(conn => ({
          workflow_id: workflow.id,
          source_node_id: conn.source,
          target_node_id: conn.target
        }));

        const { error: connectionsError } = await supabase
          .from('workflow_connections')
          .insert(connectionInserts);

        if (connectionsError) console.error('Error saving connections:', connectionsError);
      }

      toast({ title: 'Success', description: 'Workflow saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save workflow', variant: 'destructive' });
    }
  };

  const toggleWorkflowStatus = () => {
    setWorkflowStatus(prev => prev === 'active' ? 'paused' : 'active');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64 glass-input text-white"
            placeholder="Workflow Name"
          />
          <Badge variant={workflowStatus === 'active' ? 'default' : 'secondary'} className="glass-secondary">
            {workflowStatus}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={toggleWorkflowStatus} className="glass-button-outline">
            {workflowStatus === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {workflowStatus === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button onClick={saveWorkflow} className="glass-button">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Elements Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto max-h-screen">
          <h3 className="text-white font-semibold mb-4 sticky top-0 bg-gray-800 py-2">Elements</h3>
          
          {['triggers', 'actions', 'conditions', 'delays'].map(category => (
            <div key={category} className="mb-6">
              <h4 className="text-gray-300 text-sm font-medium mb-2 capitalize">{category}</h4>
              <div className="space-y-2">
                {WORKFLOW_ELEMENTS
                  .filter(element => element.category === category)
                  .map(element => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element)}
                      className="p-3 bg-gray-700 rounded-lg cursor-move hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <element.icon className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{element.title}</p>
                          <p className="text-gray-400 text-xs">{element.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-900 relative overflow-auto"
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((conn) => {
                const sourceNode = nodes.find(n => n.id === conn.source);
                const targetNode = nodes.find(n => n.id === conn.target);
                if (!sourceNode || !targetNode) return null;

                const x1 = sourceNode.position.x + 128;
                const y1 = sourceNode.position.y + 40;
                const x2 = targetNode.position.x + 128;
                const y2 = targetNode.position.y + 40;

                return (
                  <line
                    key={conn.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#60A5FA"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#60A5FA" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            <AnimatePresence>
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute cursor-pointer ${
                    selectedNode?.id === node.id ? 'ring-2 ring-blue-400' : ''
                  } ${connectingFrom === node.id ? 'ring-2 ring-green-400' : ''}`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: 10
                  }}
                  onClick={() => {
                    if (connectingFrom) {
                      completeConnection(node.id);
                    } else {
                      handleNodeClick(node);
                    }
                  }}
                >
                  <Card className="w-64 glass-card border-white/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <node.icon className="h-4 w-4 text-blue-400" />
                          <CardTitle className="text-white text-sm">{node.title}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              startConnection(node.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-green-400"
                            title="Connect to another node"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-300 text-xs">{node.description}</p>
                      {node.connections.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm">Title</Label>
                <Input
                  value={selectedNode.title}
                  onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                  className="glass-input text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Description</Label>
                <Input
                  value={selectedNode.description}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  className="glass-input text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Type</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.type}
                  </Badge>
                </div>
              </div>

              {/* Action-specific configuration */}
              {selectedNode.title === 'Send Email Campaign' && (
                <div>
                  <Label className="text-white text-sm">Select Email Campaign</Label>
                  <Select
                    value={selectedNode.data?.campaign_id || ''}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, campaign_id: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input text-white mt-1">
                      <SelectValue placeholder="Choose campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailCampaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.title === 'Add Tag' && (
                <div>
                  <Label className="text-white text-sm">Select Tag</Label>
                  <Select
                    value={selectedNode.data?.tag_id || ''}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, tag_id: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input text-white mt-1">
                      <SelectValue placeholder="Choose tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.title === 'Wait' && (
                <div>
                  <Label className="text-white text-sm">Wait Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={selectedNode.data?.duration || ''}
                    onChange={(e) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, duration: parseInt(e.target.value) } 
                    })}
                    className="glass-input text-white mt-1"
                    placeholder="Enter minutes"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
