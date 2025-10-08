import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Trash2, Link, X, CheckCircle } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'start';
  label: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
  data: any;
  connections: string[];
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Enhanced workflow element types based on GoHighLevel and your system
const workflowElements = [
  { id: 'trigger', label: '🎯 Trigger', type: 'trigger', description: 'Drag to add trigger', icon: '🎯', color: 'border-green-400' },
  { id: 'action', label: '⚡ Action', type: 'action', description: 'Drag to add action', icon: '⚡', color: 'border-blue-400' },
  { id: 'condition', label: '🔀 Condition', type: 'condition', description: 'Drag to add condition', icon: '🔀', color: 'border-yellow-400' },
  { id: 'delay', label: '⏱️ Delay', type: 'delay', description: 'Drag to add delay', icon: '⏱️', color: 'border-orange-400' },
];

// Comprehensive trigger types based on your system
const triggerTypes = [
  // E-commerce Triggers
  { value: 'purchase_paystack', label: '🛒 Purchase (Paystack)', category: 'E-commerce' },
  { value: 'payment_on_delivery', label: '💳 Payment on Delivery', category: 'E-commerce' },
  { value: 'upsell_purchase', label: '📈 Upsell Purchase', category: 'E-commerce' },
  { value: 'downsell_purchase', label: '📉 Downsell Purchase', category: 'E-commerce' },
  { value: 'abandoned_cart', label: '🛒💔 Cart Abandoned', category: 'E-commerce' },
  { value: 'meal_plan_signup', label: '🍽️ Meal Plan Signup', category: 'E-commerce' },
  
  // Customer Behavior Triggers
  { value: 'customer_signup', label: '👤 Customer Signup', category: 'Customer' },
  { value: 'customer_login', label: '🔑 Customer Login', category: 'Customer' },
  { value: 'profile_updated', label: '✏️ Profile Updated', category: 'Customer' },
  { value: 'birthday', label: '🎂 Customer Birthday', category: 'Customer' },
  { value: 'anniversary', label: '🎉 Customer Anniversary', category: 'Customer' },
  
  // Email & Communication Triggers
  { value: 'email_opened', label: '📧👁️ Email Opened', category: 'Communication' },
  { value: 'email_clicked', label: '📧🔗 Email Link Clicked', category: 'Communication' },
  { value: 'email_bounced', label: '📧❌ Email Bounced', category: 'Communication' },
  { value: 'email_unsubscribed', label: '📧🚫 Email Unsubscribed', category: 'Communication' },
  
  // Website Activity Triggers
  { value: 'page_visited', label: '🌐 Page Visited', category: 'Website' },
  { value: 'link_clicked', label: '🔗 Link Clicked', category: 'Website' },
  { value: 'form_submitted', label: '📝 Form Submitted', category: 'Website' },
  { value: 'search_performed', label: '🔍 Search Performed', category: 'Website' },
  
  // Time-based Triggers
  { value: 'date_time', label: '⏰ Date/Time', category: 'Time' },
  { value: 'recurring', label: '🔄 Recurring', category: 'Time' },
  { value: 'after_purchase', label: '⏱️ After Purchase', category: 'Time' },
  { value: 'after_signup', label: '⏱️ After Signup', category: 'Time' },
];

// Comprehensive action types based on your system
const actionTypes = [
  // Email Actions
  { value: 'send_email', label: '📧 Send Email', category: 'Email' },
  { value: 'send_email_campaign', label: '📧📢 Send Email Campaign', category: 'Email' },
  { value: 'send_welcome_email', label: '📧👋 Send Welcome Email', category: 'Email' },
  { value: 'send_follow_up', label: '📧📞 Send Follow-up', category: 'Email' },
  { value: 'send_abandoned_cart_email', label: '📧🛒 Send Abandoned Cart Email', category: 'Email' },
  
  // SMS Actions
  { value: 'send_sms', label: '💬 Send SMS', category: 'SMS' },
  { value: 'send_sms_campaign', label: '💬📢 Send SMS Campaign', category: 'SMS' },
  { value: 'send_sms_reminder', label: '💬⏰ Send SMS Reminder', category: 'SMS' },
  
  // Tag Management Actions
  { value: 'assign_tag', label: '🏷️ Assign Tag', category: 'Tags' },
  { value: 'remove_tag', label: '🏷️❌ Remove Tag', category: 'Tags' },
  { value: 'add_to_segment', label: '👥 Add to Segment', category: 'Tags' },
  { value: 'remove_from_segment', label: '👥❌ Remove from Segment', category: 'Tags' },
  
  // Task & Pipeline Actions
  { value: 'create_task', label: '✅ Create Task', category: 'Tasks' },
  { value: 'assign_task', label: '👤 Assign Task', category: 'Tasks' },
  { value: 'move_pipeline', label: '📊 Move in Pipeline', category: 'Pipeline' },
  { value: 'create_deal', label: '💼 Create Deal', category: 'Pipeline' },
  
  // Integration Actions
  { value: 'webhook', label: '🔗 Send Webhook', category: 'Integrations' },
  { value: 'api_call', label: '🌐 Make API Call', category: 'Integrations' },
  { value: 'zapier_trigger', label: '⚡ Zapier Trigger', category: 'Integrations' },
  
  // Customer Actions
  { value: 'add_note', label: '📝 Add Customer Note', category: 'Customer' },
  { value: 'update_customer', label: '✏️ Update Customer', category: 'Customer' },
  { value: 'create_opportunity', label: '🎯 Create Opportunity', category: 'Customer' },
];

// GoHighLevel-style condition types
const conditionTypes = [
  // Customer Conditions
  { value: 'customer_has_tag', label: '🏷️ Customer Has Tag', category: 'Customer' },
  { value: 'customer_hasnt_tag', label: '🏷️❌ Customer Hasn\'t Tag', category: 'Customer' },
  { value: 'customer_in_segment', label: '👥 Customer in Segment', category: 'Customer' },
  { value: 'customer_value', label: '💰 Customer Value', category: 'Customer' },
  { value: 'customer_purchase_count', label: '🛒 Purchase Count', category: 'Customer' },
  { value: 'customer_last_purchase', label: '📅 Last Purchase Date', category: 'Customer' },
  
  // Email Conditions
  { value: 'email_opened', label: '📧👁️ Email Opened', category: 'Email' },
  { value: 'email_clicked', label: '📧🔗 Email Clicked', category: 'Email' },
  { value: 'email_bounced', label: '📧❌ Email Bounced', category: 'Email' },
  
  // Order Conditions
  { value: 'order_value', label: '💰 Order Value', category: 'Order' },
  { value: 'order_contains_product', label: '📦 Order Contains Product', category: 'Order' },
  { value: 'order_shipping_method', label: '🚚 Shipping Method', category: 'Order' },
  
  // Time Conditions
  { value: 'time_of_day', label: '🕐 Time of Day', category: 'Time' },
  { value: 'day_of_week', label: '📅 Day of Week', category: 'Time' },
  { value: 'date_range', label: '📅 Date Range', category: 'Time' },
  
  // Custom Conditions
  { value: 'custom_field', label: '🔧 Custom Field', category: 'Custom' },
  { value: 'url_visited', label: '🌐 URL Visited', category: 'Custom' },
  { value: 'device_type', label: '📱 Device Type', category: 'Custom' },
];

// GoHighLevel-style delay types
const delayTypes = [
  // Time-based Delays
  { value: '15_minutes', label: '⏱️ 15 Minutes', duration: 15, unit: 'minutes' },
  { value: '30_minutes', label: '⏱️ 30 Minutes', duration: 30, unit: 'minutes' },
  { value: '1_hour', label: '⏱️ 1 Hour', duration: 1, unit: 'hours' },
  { value: '2_hours', label: '⏱️ 2 Hours', duration: 2, unit: 'hours' },
  { value: '4_hours', label: '⏱️ 4 Hours', duration: 4, unit: 'hours' },
  { value: '6_hours', label: '⏱️ 6 Hours', duration: 6, unit: 'hours' },
  { value: '12_hours', label: '⏱️ 12 Hours', duration: 12, unit: 'hours' },
  { value: '1_day', label: '⏱️ 1 Day', duration: 1, unit: 'days' },
  { value: '2_days', label: '⏱️ 2 Days', duration: 2, unit: 'days' },
  { value: '3_days', label: '⏱️ 3 Days', duration: 3, unit: 'days' },
  { value: '1_week', label: '⏱️ 1 Week', duration: 7, unit: 'days' },
  { value: '2_weeks', label: '⏱️ 2 Weeks', duration: 14, unit: 'days' },
  { value: '1_month', label: '⏱️ 1 Month', duration: 30, unit: 'days' },
  
  // Business Logic Delays
  { value: 'after_purchase', label: '⏱️ After Purchase', duration: 0, unit: 'custom' },
  { value: 'after_signup', label: '⏱️ After Signup', duration: 0, unit: 'custom' },
  { value: 'after_email_open', label: '⏱️ After Email Open', duration: 0, unit: 'custom' },
  { value: 'after_email_click', label: '⏱️ After Email Click', duration: 0, unit: 'custom' },
];

export const SimpleWorkflowBuilder = () => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'start-1',
      type: 'start',
      label: '🎯 Workflow Start',
      description: 'Entry point for your automation',
      icon: '🎯',
      position: { x: 50, y: 50 },
      data: {},
      connections: []
    }
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Integration data states
  const [customerTags, setCustomerTags] = useState<any[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Load integration data on component mount
  useEffect(() => {
    loadIntegrationData();
  }, []);

  const loadIntegrationData = async () => {
    try {
      // Load customer tags
      const { data: tags } = await supabase.from('customer_tags').select('*');
      if (tags) setCustomerTags(tags);

      // Load email campaigns
      const { data: campaigns } = await supabase.from('email_campaigns').select('*');
      if (campaigns) setEmailCampaigns(campaigns);

      // Load email templates
      const { data: templates } = await supabase.from('email_templates').select('*');
      if (templates) setEmailTemplates(templates);

      // Load products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) setProducts(productsData);

    } catch (error) {
      console.error('Error loading integration data:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    console.log('Drag started:', elementType);
    setDraggedElement(elementType);
    e.dataTransfer.setData('text/plain', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event triggered');
    
    if (!canvasRef.current) {
      console.error('Canvas ref not available');
      return;
    }
    
    if (!draggedElement) {
      console.error('No dragged element');
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    console.log('Drop position:', position, 'Element type:', draggedElement);
    addNode(draggedElement, position);
    setDraggedElement(null);
  };

  const addNode = (nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType as any,
      label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
      description: `Add ${nodeType} configuration`,
      icon: workflowElements.find(el => el.type === nodeType)?.icon || '📋',
      position,
      data: {},
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
    toast({
      title: 'Node Added',
      description: `${nodeType} node added successfully`,
    });
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Enhanced connection handling
  const startConnection = (sourceId: string) => {
    setConnectionMode(sourceId);
    toast({
      title: 'Connection Mode',
      description: 'Click another node to create a connection',
    });
  };

  const handleNodeClick = (node: WorkflowNode) => {
    if (connectionMode && connectionMode !== node.id) {
      // Create connection
      addConnection(connectionMode, node.id);
      setConnectionMode(null);
    } else {
      // Open node configuration
      setSelectedNode(node);
      setNodeDialogOpen(true);
    }
  };

  const addConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    
    // Check if connection already exists
    const existingConnection = connections.find(
      conn => conn.source === sourceId && conn.target === targetId
    );
    
    if (existingConnection) {
      toast({
        title: 'Connection Exists',
        description: 'These nodes are already connected',
        variant: 'destructive',
      });
      return;
    }

    const newConnection: WorkflowConnection = {
      id: `conn-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: ''
    };

    setConnections(prev => [...prev, newConnection]);
    
    // Update node connections
    setNodes(prev => prev.map(node => {
      if (node.id === sourceId) {
        return { ...node, connections: [...node.connections, targetId] };
      }
      return node;
    }));

    toast({
      title: 'Connection Created',
      description: 'Nodes connected successfully',
    });
  };

  const deleteConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      
      // Remove from node connections
      setNodes(prev => prev.map(node => {
        if (node.id === connection.source) {
          return { ...node, connections: node.connections.filter(c => c !== connection.target) };
        }
        return node;
      }));
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        nodes: nodes,
        connections: connections,
        is_active: true,
      };

      const { error } = await supabase
        .from('automation_rules')
        .insert({
          name: workflowName,
          trigger: 'workflow',
          action: 'execute_workflow',
          trigger_data: JSON.stringify(workflowData),
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderConnection = (connection: WorkflowConnection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return null;

    const startX = sourceNode.position.x + 120; // Node width
    const startY = sourceNode.position.y + 30;  // Node height/2
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 30;

    return (
      <svg
        key={connection.id}
        className="absolute pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#6b7280"
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${connection.id})`}
        />
        <circle
          cx={endX - 5}
          cy={endY}
          r="3"
          fill="#ef4444"
          className="cursor-pointer"
          onClick={() => deleteConnection(connection.id)}
        />
      </svg>
    );
  };

  // Render additional configuration fields based on node type and data
  const renderAdditionalFields = (node: WorkflowNode) => {
    switch (node.type) {
      case 'trigger':
        if (node.data.triggerType === 'purchase_paystack' || node.data.triggerType === 'payment_on_delivery') {
          return (
            <div>
              <Label className="text-glass-text">Minimum Order Value</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={node.data.minOrderValue || ''}
                onChange={(e) => updateNode(node.id, { 
                  data: { ...node.data, minOrderValue: e.target.value } 
                })}
                className="glass-input"
              />
            </div>
          );
        }
        break;

      case 'action':
        if (node.data.actionType === 'assign_tag' || node.data.actionType === 'remove_tag') {
          return (
            <div>
              <Label className="text-glass-text">Select Tag</Label>
              <Select
                value={node.data.tagId || ''}
                onValueChange={(value) => updateNode(node.id, { 
                  data: { ...node.data, tagId: value } 
                })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {customerTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }}></div>
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (node.data.actionType === 'send_email_campaign') {
          return (
            <div>
              <Label className="text-glass-text">Select Campaign</Label>
              <Select
                value={node.data.campaignId || ''}
                onValueChange={(value) => updateNode(node.id, { 
                  data: { ...node.data, campaignId: value } 
                })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {emailCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (node.data.actionType === 'send_email') {
          return (
            <div>
              <Label className="text-glass-text">Select Template</Label>
              <Select
                value={node.data.templateId || ''}
                onValueChange={(value) => updateNode(node.id, { 
                  data: { ...node.data, templateId: value } 
                })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        break;

      case 'condition':
        if (node.data.conditionType === 'customer_has_tag' || node.data.conditionType === 'customer_hasnt_tag') {
          return (
            <div>
              <Label className="text-glass-text">Tag to Check</Label>
              <Select
                value={node.data.conditionTagId || ''}
                onValueChange={(value) => updateNode(node.id, { 
                  data: { ...node.data, conditionTagId: value } 
                })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {customerTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }}></div>
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (node.data.conditionType === 'order_contains_product') {
          return (
            <div>
              <Label className="text-glass-text">Product to Check</Label>
              <Select
                value={node.data.conditionProductId || ''}
                onValueChange={(value) => updateNode(node.id, { 
                  data: { ...node.data, conditionProductId: value } 
                })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        break;
    }
    return null;
  };

  return (
    <div className="h-screen flex flex-col glass-card">
      {/* Toolbar */}
      <div className="p-4 border-b border-glass-border bg-glass/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="glass-input w-64"
            />
            <Button onClick={saveWorkflow} disabled={loading} className="glass-button">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
          {connectionMode && (
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 text-sm">Connection Mode Active</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConnectionMode(null)}
                className="text-blue-400 hover:text-blue-300"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Workflow Elements</h3>
          <p className="text-gray-400 text-sm mb-4">Drag elements to the canvas</p>
          
          <div className="space-y-3">
            {workflowElements.map((element) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element.type)}
                className={`p-3 bg-gray-700 rounded-lg cursor-move hover:bg-gray-600 transition-colors border-2 ${element.color}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{element.icon}</div>
                  <p className="text-white text-sm font-medium">{element.label}</p>
                  <p className="text-gray-300 text-xs">{element.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-700 rounded-lg">
            <h4 className="text-white text-sm font-medium mb-2">Instructions</h4>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Drag elements from sidebar to canvas</li>
              <li>• Click nodes to configure them</li>
              <li>• Use connection mode to link nodes</li>
              <li>• Save your workflow when done</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className={`flex-1 relative bg-gray-900 overflow-auto transition-colors ${
            draggedElement ? 'bg-gray-800 ring-2 ring-blue-400 ring-opacity-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Drop Zone Indicator */}
          {draggedElement && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📥</div>
                <div className="text-blue-300 text-lg font-medium">Drop {draggedElement} here</div>
                <div className="text-blue-200 text-sm">Release to add to workflow</div>
              </div>
            </div>
          )}

          {/* Connections */}
          {connections.map(renderConnection)}

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-pointer glass-card border-2 ${
                node.type === 'start' ? 'border-green-400' :
                node.type === 'trigger' ? 'border-green-400' :
                node.type === 'action' ? 'border-blue-400' :
                node.type === 'condition' ? 'border-yellow-400' :
                'border-orange-400'
              } shadow-glow transition-all duration-200 ${
                connectionMode === node.id ? 'ring-4 ring-blue-400 ring-opacity-75' : ''
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: '120px',
                minHeight: '60px'
              }}
              onClick={() => handleNodeClick(node)}
            >
              <div className="p-3">
                <div className="text-center">
                  <div className="text-2xl mb-1">{node.icon}</div>
                  <div className="text-white text-sm font-medium truncate">{node.label}</div>
                  <div className="text-gray-300 text-xs truncate">{node.description}</div>
                </div>
                
                {/* Connection buttons */}
                <div className="flex justify-center mt-2 space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-6 w-6 p-0 ${
                      connectionMode === node.id 
                        ? 'text-blue-400 bg-blue-400/20' 
                        : 'text-gray-400 hover:text-blue-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectionMode === node.id) {
                        setConnectionMode(null);
                      } else {
                        startConnection(node.id);
                      }
                    }}
                  >
                    {connectionMode === node.id ? <CheckCircle className="h-3 w-3" /> : <Link className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Configuration Dialog - Fixed Modal */}
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="glass-card max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-glass-text">Configure Node</DialogTitle>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-glass-text">Node Label</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNode(selectedNode.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                value={selectedNode.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="glass-input"
              />

              {selectedNode.type === 'trigger' && (
                <div>
                  <Label className="text-glass-text">Trigger Type</Label>
                  <Select
                    value={selectedNode.data.triggerType || ''}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, triggerType: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {triggerTypes.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === 'action' && (
                <div>
                  <Label className="text-glass-text">Action Type</Label>
                  <Select
                    value={selectedNode.data.actionType || ''}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, actionType: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {actionTypes.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div>
                  <Label className="text-glass-text">Condition Type</Label>
                  <Select
                    value={selectedNode.data.conditionType || ''}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, conditionType: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {conditionTypes.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div>
                  <Label className="text-glass-text">Delay Duration</Label>
                  <Select
                    value={selectedNode.data.delay || '1_hour'}
                    onValueChange={(value) => updateNode(selectedNode.id, { 
                      data: { ...selectedNode.data, delay: value } 
                    })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {delayTypes.map((delay) => (
                        <SelectItem key={delay.value} value={delay.value}>
                          {delay.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Render additional configuration fields */}
              {renderAdditionalFields(selectedNode)}

              <Button 
                onClick={() => setNodeDialogOpen(false)} 
                className="glass-button w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
