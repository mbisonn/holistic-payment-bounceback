import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Handle,
  Position,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import { Plus, Save, Trash2, Maximize2, Grid } from 'lucide-react';
import { WorkflowErrorBoundary } from './WorkflowErrorBoundary';

// Enhanced workflow nodes for GoHighLevel-style automation
const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'custom',
    data: { 
      label: '🎯 Workflow Start', 
      nodeType: 'start',
      description: 'Entry point for your automation'
    },
    position: { x: 50, y: 50 },
    className: 'glass-card border-green-400 shadow-glow',
  },
];

const initialEdges: Edge[] = [];

// GoHighLevel-style triggers
const triggerTypes = [
  { value: 'customer_signup', label: '👤 Customer Signup', icon: '👤', color: 'green' },
  { value: 'order_placed', label: '🛒 Order Placed', icon: '🛒', color: 'blue' },
  { value: 'cart_abandoned', label: '🛒💔 Cart Abandoned', icon: '💔', color: 'orange' },
  { value: 'email_opened', label: '📧👁️ Email Opened', icon: '👁️', color: 'purple' },
  { value: 'link_clicked', label: '🔗 Link Clicked', icon: '🔗', color: 'indigo' },
  { value: 'birthday', label: '🎂 Customer Birthday', icon: '🎂', color: 'pink' },
  { value: 'date_time', label: '⏰ Date/Time', icon: '⏰', color: 'gray' },
  { value: 'meal_plan_received', label: '🥗 Meal Plan Received (Webhook)', icon: '🥗', color: 'emerald' },
];

// GoHighLevel-style actions
const actionTypes = [
  { value: 'send_email', label: '📧 Send Email', icon: '📧', color: 'blue' },
  { value: 'send_sms', label: '💬 Send SMS', icon: '💬', color: 'green' },
  { value: 'assign_tag', label: '🏷️ Assign Tag', icon: '🏷️', color: 'yellow' },
  { value: 'remove_tag', label: '🏷️❌ Remove Tag', icon: '❌', color: 'red' },
  { value: 'create_task', label: '✅ Create Task', icon: '✅', color: 'purple' },
  { value: 'move_pipeline', label: '📊 Move in Pipeline', icon: '📊', color: 'teal' },
  { value: 'webhook', label: '🔗 Webhook', icon: '🔗', color: 'indigo' },
  { value: 'send_meal_plan', label: '🥗 Send Meal Plan', icon: '🥗', color: 'emerald' },
];

// Draggable sidebar elements
const sidebarElements = [
  { id: 'trigger', label: '🎯 Trigger', type: 'trigger', description: 'Drag to add trigger' },
  { id: 'action', label: '⚡ Action', type: 'action', description: 'Drag to add action' },
  { id: 'condition', label: '🔀 Condition', type: 'condition', description: 'Drag to add condition' },
  { id: 'delay', label: '⏱️ Delay', type: 'delay', description: 'Drag to add delay' },
];

type VisualWorkflowBuilderProps = {
  onClose?: () => void;
  onSaved?: () => void;
  workflowId?: string;
  initialName?: string;
  initialWorkflow?: any;
};

export const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({ onClose: _onClose, onSaved, workflowId, initialName, initialWorkflow }) => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rf = useRef<ReactFlowInstance | null>(null);
  const [placeType, setPlaceType] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const didAutoLayoutOnce = useRef(false);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  
  // Webhook URL for meal plan trigger
  const webhookUrl = useMemo(() => {
    return `${SUPABASE_URL}/functions/v1/meal-plan-webhook`;
  }, []);

  // Style edge labels for better visibility
  useEffect(() => {
    if (!edges.length) return;
    let changed = false;
    const styled = edges.map((e) => {
      if (!e.label) return e;
      const hasStyle = (e as any).labelStyle && (e as any).labelBgStyle;
      if (hasStyle) return e;
      changed = true;
      return {
        ...e,
        labelBgStyle: { fill: 'rgba(30, 41, 59, 0.85)', stroke: 'rgba(255,255,255,0.08)' },
        labelBgPadding: [3, 2],
        labelBgBorderRadius: 6,
        labelStyle: { fill: '#fff', fontWeight: 600, fontSize: 11 },
      } as Edge;
    });
    if (changed) setEdges(styled);
  }, [edges, setEdges]);

  // Load initial workflow for editing
  useEffect(() => {
    try {
      if (initialName) setWorkflowName(initialName);
      if (!initialWorkflow) return;
      const wf = typeof initialWorkflow === 'string' ? JSON.parse(initialWorkflow) : initialWorkflow;
      if (wf?.nodes && Array.isArray(wf.nodes)) setNodes(wf.nodes);
      if (wf?.edges && Array.isArray(wf.edges)) {
        const normalizedEdges = wf.edges.map((e: any) => {
          if (!e?.label) {
            if (e?.sourceHandle === 'yes') return { ...e, label: 'Yes' };
            if (e?.sourceHandle === 'no') return { ...e, label: 'No' };
          }
          return e;
        });
        setEdges(normalizedEdges);
      }
    } catch (e) {
      console.warn('Failed to parse initialWorkflow; falling back to defaults', e);
    }
  }, [initialName, initialWorkflow, setNodes, setEdges]);

  // Custom node with dynamic handles, including condition Yes/No
  const CustomNode = ({ data }: { data: any }) => {
    const isCondition = data.nodeType === 'condition';
    return (
      <div className={`glass-card border border-white/20 rounded-md p-3 text-sm text-white min-w-[200px] ${
        isCondition ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10' : ''
      }`}>
        <Handle type="target" position={Position.Left} className="!bg-white/70" />
        <div className="font-medium mb-1 flex items-center gap-2">
          <span>{data.icon}</span>
          <span>{data.label}</span>
          {data.nodeType && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-wide">
              {String(data.nodeType)}
            </span>
          )}
        </div>
        {data.description && (
          <div className="text-xs text-gray-300">{data.description}</div>
        )}
        {!isCondition && (
          <Handle type="source" position={Position.Right} className="!bg-white/70" />
        )}
        {isCondition && (
          <>
            <Handle id="yes" type="source" position={Position.Right} className="!bg-emerald-300" />
            <Handle id="no" type="source" position={Position.Bottom} className="!bg-rose-300" />
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">Yes</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">No</span>
          </div>
          </>
        )}
      </div>
    );
  };

  // Keep dialog state in sync with selected node to avoid modal instability
  useEffect(() => {
    setNodeDialogOpen(!!selectedNode);
  }, [selectedNode]);

  // Load customer tags for action configuration
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('customer_tags').select('id, name');
        if (error) throw error;
        setAvailableTags((data || []).map((t: any) => ({ id: t.id, name: t.name })));
      } catch (e) {
        console.error('Failed to load tags', e);
      }
    })();
  }, []);

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => {
      const source = (params as any).source as string;
      const target = (params as any).target as string;
      if (!source || !target) return eds;
      if (source === target) return eds;
      const exists = eds.some(e => e.source === source && e.target === target);
      if (exists) return eds;
      const targetNode = nodes.find(n => n.id === target);
      if (targetNode?.data?.nodeType === 'start' || targetNode?.data?.nodeType === 'trigger') return eds;
      const alreadyHasIncoming = eds.some(e => e.target === target);
      if (alreadyHasIncoming) return eds;
      const sourceNode = nodes.find(n => n.id === source);
      const sourceHandle = (params as any).sourceHandle as string | undefined;
      let label: string | undefined = undefined;
      if (sourceNode?.data?.nodeType === 'condition') {
        if (sourceHandle !== 'yes' && sourceHandle !== 'no') return eds;
        const hasEdgeForHandle = eds.some(e => e.source === source && e.sourceHandle === sourceHandle);
        if (hasEdgeForHandle) return eds;
        label = sourceHandle === 'yes' ? 'Yes' : 'No';
      } else {
        const hasOutgoing = eds.some(e => e.source === source);
        if (hasOutgoing) return eds;
      }
      return addEdge({ ...(params as any), label, animated: true, style: { stroke: '#7dd3fc' } }, eds);
    });
  }, [nodes]);

  // Validate potential connections in UI
  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const { source, target, sourceHandle } = connection as any;
    if (!source || !target) return false;
    if (source === target) return false;
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return false;
    // no incoming to start/trigger
    if (targetNode.data?.nodeType === 'start' || targetNode.data?.nodeType === 'trigger') return false;
    // only one incoming edge per node
    if (edges.some(e => e.target === target)) return false;
    // condition must use yes/no handles
    if (sourceNode.data?.nodeType === 'condition') {
      if (sourceHandle !== 'yes' && sourceHandle !== 'no') return false;
      // prevent more than one edge per handle
      if (edges.some(e => e.source === source && e.sourceHandle === sourceHandle)) return false;
      return true;
    }
    // Non-condition: only one outgoing edge
    if (edges.some(e => e.source === source)) return false;
    return true;
  }, [nodes, edges]);

  // Dagre-based auto layout for improved layering and fewer crossings
  const applyDagreLayout = useCallback(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 140, marginx: 24, marginy: 24 });
    g.setDefaultEdgeLabel(() => ({}));

    // Build incoming edge info to slightly nudge Yes/No branches vertically after layout
    const incoming = new Map<string, 'yes' | 'no' | null>();
    for (const e of edges) {
      if (!incoming.has(e.target)) {
        const h = (e as any).sourceHandle as 'yes' | 'no' | undefined;
        incoming.set(e.target, h === 'yes' ? 'yes' : h === 'no' ? 'no' : null);
      }
    }

    // Set nodes with approximate sizes
    const defaultW = 220;
    const defaultH = 80;
    nodes.forEach((n) => {
      const w = (n as any).width || defaultW;
      const h = (n as any).height || defaultH;
      g.setNode(n.id, { width: w, height: h });
    });

    // Set edges
    edges.forEach((e) => g.setEdge(e.source, e.target));

    dagre.layout(g);

    // Apply positions (dagre returns centers)
    const newNodes = nodes.map((n) => {
      const dag = g.node(n.id);
      if (!dag) return n;
      const w = (n as any).width || defaultW;
      const h = (n as any).height || defaultH;
      let y = dag.y - h / 2;
      // Nudge based on branch to separate Yes/No vertically a bit
      const branch = incoming.get(n.id);
      if (branch === 'yes') y -= 20;
      else if (branch === 'no') y += 20;
      return {
        ...n,
        position: { x: dag.x - w / 2, y },
      } as Node;
    });

    setNodes(newNodes);
    setTimeout(() => rf.current && rf.current.fitView({ padding: 0.2 }), 0);
  }, [nodes, edges]);

  // Drag and drop handlers
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const screenPoint = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      if (!rf.current) return;
      const position = rf.current.screenToFlowPosition(screenPoint);

      addNodeByType(type, position);
    },
    []
  );

  // (removed) getCanvasCenterPosition was unused

  const addNodeByType = (nodeType: string, position: { x: number; y: number }) => {
    try {
      let newNode: Node;
      
      switch (nodeType) {
        case 'trigger':
          newNode = {
            id: `trigger-${Date.now()}`,
            type: 'custom',
            data: { 
              label: '🎯 New Trigger', 
              nodeType: 'trigger',
              description: 'Choose a trigger event',
              icon: '🎯'
            },
            position,
            className: 'glass-card border-green-400 shadow-glow',
          };
          break;
        case 'action':
          newNode = {
            id: `action-${Date.now()}`,
            type: 'custom',
            data: { 
              label: '⚡ New Action', 
              nodeType: 'action',
              description: 'Choose an action to perform',
              icon: '⚡'
            },
            position,
            className: 'glass-card border-blue-400 shadow-glow',
          };
          break;
        case 'condition':
          newNode = {
            id: `condition-${Date.now()}`,
            type: 'custom',
            data: { 
              label: '🔀 Condition', 
              nodeType: 'condition',
              description: 'Add conditional logic',
              icon: '🔀'
            },
            position,
            className: 'glass-card border-yellow-400 shadow-glow',
          };
          break;
        case 'delay':
          newNode = {
            id: `delay-${Date.now()}`,
            type: 'custom',
            data: { 
              label: '⏱️ Wait/Delay', 
              nodeType: 'delay', 
              delay: '1 hour',
              description: 'Add a time delay',
              icon: '⏱️'
            },
            position,
            className: 'glass-card border-orange-400 shadow-glow',
          };
          break;
        default:
          return;
      }

      setNodes((nds) => [...nds, newNode]);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error adding node:', err);
      setError('Failed to add node. Please try again.');
    }
  };

  // Fallback button functions
  const addTriggerNode = () => setPlaceType('trigger');
  const addActionNode = () => setPlaceType('action');
  const addConditionNode = () => setPlaceType('condition');
  const addDelayNode = () => setPlaceType('delay');

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    // Select only on single click; avoid opening modal to prevent instability while dragging
    setSelectedNode(node);
  };

  const onNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeDialogOpen(true);
  };

  const onNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    const wrapper = reactFlowWrapper.current?.getBoundingClientRect();
    if (!wrapper) return;
    setContextMenu({ x: event.clientX - wrapper.left, y: event.clientY - wrapper.top, nodeId: node.id });
  };

  const duplicateNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newNode: Node = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
    };
    setNodes((nds) => nds.concat(newNode));
    setContextMenu(null);
  };

  const removeNodeById = (nodeId: string) => {
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    setContextMenu(null);
  };

  // Auto layout: BFS levels; within each level, group by parent and order Yes (top), then unlabeled, then No (bottom)
  const applyAutoLayout = useCallback(() => {
    const outgoing = new Map<string, string[]>();
    const incomingEdge = new Map<string, { parent: string | null; handle: 'yes' | 'no' | null }>();
    for (const e of edges) {
      if (!outgoing.has(e.source)) outgoing.set(e.source, []);
      outgoing.get(e.source)!.push(e.target);
      // record incoming from first seen parent only (we enforce single incoming per node)
      if (!incomingEdge.has(e.target)) {
        const h = (e as any).sourceHandle as 'yes' | 'no' | undefined;
        incomingEdge.set(e.target, { parent: e.source, handle: h === 'yes' ? 'yes' : h === 'no' ? 'no' : null });
      }
    }

    const roots = nodes.filter(n => n.data?.nodeType === 'start' || n.data?.nodeType === 'trigger');
    const visited = new Set<string>();
    const level = new Map<string, number>();
    const queue: string[] = [];
    for (const r of roots) {
      level.set(r.id, 0);
      queue.push(r.id);
      visited.add(r.id);
    }
    while (queue.length) {
      const cur = queue.shift()!;
      const nexts = outgoing.get(cur) || [];
      for (const t of nexts) {
        if (!visited.has(t)) {
          level.set(t, (level.get(cur) || 0) + 1);
          visited.add(t);
          queue.push(t);
        }
      }
    }

    const groups = new Map<number, string[]>();
    for (const n of nodes) {
      const l = level.get(n.id) ?? 0;
      if (!groups.has(l)) groups.set(l, []);
      groups.get(l)!.push(n.id);
    }

    const colGap = 280;
    const rowGap = 180;
    const startX = 50;
    const startY = 50;

    const newNodes = nodes.map(n => ({ ...n }));
    const byId = new Map(newNodes.map(n => [n.id, n] as const));
    const sortedLevels = Array.from(groups.keys()).sort((a, b) => a - b);
    const branchPriority = (id: string) => {
      const info = incomingEdge.get(id);
      if (!info) return 1; // default middle
      if (info.handle === 'yes') return 0;
      if (info.handle === 'no') return 2;
      return 1;
    };
    for (const l of sortedLevels) {
      const ids = groups.get(l)!;
      // stable-ish sort: by parent id to group siblings, then by branch priority, then by id
      ids.sort((a, b) => {
        const pa = incomingEdge.get(a)?.parent || '';
        const pb = incomingEdge.get(b)?.parent || '';
        if (pa !== pb) return pa.localeCompare(pb);
        const ba = branchPriority(a);
        const bb = branchPriority(b);
        if (ba !== bb) return ba - bb;
        return a.localeCompare(b);
      });
      ids.forEach((id, idx) => {
        const node = byId.get(id)!;
        node.position = { x: startX + l * colGap, y: startY + idx * rowGap } as any;
      });
    }

    setNodes(newNodes);
    // Fit after a tick
    setTimeout(() => rf.current && rf.current.fitView({ padding: 0.2 }), 0);
  }, [nodes, edges]);

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  const uploadMealPlanFile = async (file: File) => {
    if (!file || !selectedNode) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop() || 'pdf';
      const fileName = `meal-plan-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('meal_plans')
        .upload(fileName, file, { upsert: false, contentType: 'application/pdf' });
      if (upErr) throw upErr;
      updateNodeData(selectedNode.id, { mealPlanPdfPath: fileName });
      toast({ title: 'Uploaded', description: 'Meal plan PDF uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message || 'Could not upload PDF', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };


  const validateWorkflow = () => {
    const triggerCount = nodes.filter(n => n.data?.nodeType === 'trigger').length;
    if (triggerCount < 1) return 'Workflow must contain at least one trigger node';
    for (const n of nodes) {
      const t = n.data?.nodeType;
      if (t === 'trigger' && !n.data?.triggerType) return `Trigger node "${n.data?.label || n.id}" is missing Trigger Type`;
      if (t === 'action' && !n.data?.actionType) return `Action node "${n.data?.label || n.id}" is missing Action Type`;
      if (t === 'delay' && (n.data?.delay == null || n.data?.delay === '')) return `Delay node "${n.data?.label || n.id}" is missing duration`;
      if (t === 'condition' && !n.data?.conditionExpr) return `Condition node "${n.data?.label || n.id}" is missing condition expression`;
    }
    // Each condition must have both Yes and No branches
    const conditionNodes = nodes.filter(n => n.data?.nodeType === 'condition');
    for (const c of conditionNodes) {
      const yesEdge = edges.find(e => e.source === c.id && (e as any).sourceHandle === 'yes');
      const noEdge = edges.find(e => e.source === c.id && (e as any).sourceHandle === 'no');
      if (!yesEdge || !noEdge) return `Condition node "${c.data?.label || c.id}" must have both Yes and No connections`;
    }
    return null;
  };

  const saveWorkflow = async () => {
    const validationError = validateWorkflow();
    if (validationError) {
      toast({ title: 'Validation error', description: validationError, variant: 'destructive' });
      return;
    }
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
      // normalize payload (strip runtime-only fields)
      const serializedNodes = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: (n as any).width,
        height: (n as any).height,
      }));
      const serializedEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: (e as any).targetHandle ?? null,
        animated: e.animated ?? false,
        style: e.style || undefined,
        label: e.label || undefined,
      }));
      const workflowData = {
        name: workflowName,
        nodes: serializedNodes,
        edges: serializedEdges,
        is_active: true,
        version: 1,
      };

      let error: any = null;
      if (workflowId) {
        const { error: upErr } = await supabase
          .from('automation_rules')
          .update({
            name: workflowName,
            trigger_data: JSON.stringify(workflowData),
          })
          .eq('id', workflowId);
        error = upErr;
      } else {
        const { error: insErr } = await supabase
          .from('automation_rules')
          .insert({
            name: workflowName,
            trigger: 'workflow',
            action: 'execute_workflow',
            trigger_data: JSON.stringify(workflowData),
            is_active: true,
          });
        error = insErr;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
      onSaved?.();
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

  // If there's an error, show error message
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center glass-card">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Workflow Builder Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="glass-button"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WorkflowErrorBoundary>
      <ReactFlowProvider>
        <div className="h-full flex flex-col glass-card max-h-[85vh] min-h-[60vh]">
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
            </div>

            <div className="flex space-x-2">
              <Button onClick={addTriggerNode} size="sm" className="glass-button-outline">
                <Plus className="h-4 w-4 mr-1" />
                Trigger
              </Button>
              <Button onClick={addActionNode} size="sm" className="glass-button-outline">
                <Plus className="h-4 w-4 mr-1" />
                Action
              </Button>
              <Button onClick={addConditionNode} size="sm" className="glass-button-outline">
                <Plus className="h-4 w-4 mr-1" />
                Condition
              </Button>
              <Button onClick={addDelayNode} size="sm" className="glass-button-outline">
                <Plus className="h-4 w-4 mr-1" />
                Delay
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="glass-button-outline"
                  onClick={() => rf.current && rf.current.fitView({ padding: 0.2 })}
                >
                  <Maximize2 className="h-4 w-4 mr-1" /> Fit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="glass-button-outline"
                  onClick={applyAutoLayout}
                >
                  Auto Layout (Basic)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="glass-button-outline"
                  onClick={applyDagreLayout}
                >
                  Auto Layout (Dagre)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`glass-button-outline ${snapEnabled ? 'bg-white/10' : ''}`}
                  onClick={() => setSnapEnabled((v) => !v)}
                >
                  <Grid className="h-4 w-4 mr-1" /> {snapEnabled ? 'Grid On' : 'Grid Off'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Sidebar */}
            <div className="w-full md:w-64 glass-card p-3 rounded-lg border border-white/10 order-2 md:order-1">
              <h3 className="text-white font-semibold mb-4">Workflow Elements</h3>
              <p className="text-gray-400 text-sm mb-4">Drag elements to the canvas or click to add</p>
              
              <div className="space-y-3">
                {sidebarElements.map((element) => (
                  <div
                    key={element.id}
                    className="glass-card p-3 rounded-md border border-white/10 cursor-grab active:cursor-grabbing hover:bg-white/5"
                    draggable
                    onDragStart={(event) => onDragStart(event, element.type)}
                    onClick={() => {
                      setPlaceType(element.type);
                      toast({ title: 'Placement Mode', description: 'Tap the canvas to place the node', duration: 1500 });
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{element.label}</div>
                      <p className="text-gray-300 text-xs">{element.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow Canvas */}
            <div className="relative flex-1 min-h-[50vh] md:min-h-[60vh] order-1 md:order-2" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={(params) => {
                  const sourceNode = nodes.find(n => n.id === (params as any).source);
                  const targetNode = nodes.find(n => n.id === (params as any).target);
                  if (!sourceNode || !targetNode) return;
                  if (!isValidConnection(params as Connection)) return;
                  onConnect(params);
                }}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeContextMenu={onNodeContextMenu}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onPaneClick={(event) => {
                  if (!placeType) return;
                  const bounds = reactFlowWrapper.current?.getBoundingClientRect();
                  if (!bounds) return;
                  const screenPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top } as any;
                  if (!rf.current) return;
                  const position = rf.current.screenToFlowPosition(screenPoint);
                  addNodeByType(placeType, position);
                  setPlaceType(null);
                  setContextMenu(null);
                }}
                fitView
                className="bg-glass/30"
                nodeTypes={{ custom: CustomNode }}
                edgeTypes={{}}
                snapToGrid={snapEnabled}
                snapGrid={[16, 16]}
                isValidConnection={isValidConnection}
                onInit={(instance) => {
                  rf.current = instance;
                  // Auto-fit shortly after init to ensure dimensions settled
                  setTimeout(() => {
                    if (rf.current) {
                      rf.current.fitView({ padding: 0.2 });
                      if (!didAutoLayoutOnce.current) {
                        didAutoLayoutOnce.current = true;
                        applyDagreLayout();
                      }
                    }
                  }, 50);
                }}
              >
                <Controls className="glass-card" />
                <MiniMap className="glass-card" />
                <Background />
              </ReactFlow>

              {contextMenu && (
                <div
                  className="absolute z-50 bg-gray-800/95 border border-white/10 rounded-md shadow-lg"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
                    onClick={() => duplicateNode(contextMenu.nodeId)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-white/10"
                    onClick={() => removeNodeById(contextMenu.nodeId)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Inspector Panel */}
            <div className="w-full md:w-80 glass-card p-4 rounded-lg border border-white/10 order-3 hidden md:block">
              <h3 className="text-white font-semibold mb-4">Inspector</h3>
              {!selectedNode ? (
                <p className="text-sm text-gray-400">Select a node to edit its properties</p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <Label className="text-glass-text">Node Label</Label>
                    <Input
                      value={String(selectedNode.data.label || '')}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="glass-input mt-1"
                    />
                  </div>

                  {selectedNode.data.nodeType === 'trigger' && (
                    <div>
                      <Label className="text-glass-text">Trigger Type</Label>
                      <Select
                        value={String(selectedNode.data.triggerType || '')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { triggerType: value })}
                      >
                        <SelectTrigger className="glass-input mt-1">
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
                      {!selectedNode.data.triggerType && (
                        <p className="text-xs text-amber-400 mt-1">Required to run the workflow.</p>
                      )}
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'action' && (
                    <div>
                      <Label className="text-glass-text">Action Type</Label>
                      <Select
                        value={String(selectedNode.data.actionType || '')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { actionType: value })}
                      >
                        <SelectTrigger className="glass-input mt-1">
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
                      {!selectedNode.data.actionType && (
                        <p className="text-xs text-amber-400 mt-1">Required before saving.</p>
                      )}
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'delay' && (
                    <div>
                      <Label className="text-glass-text">Delay Duration</Label>
                      <Select
                        value={String(selectedNode.data.delay || '1 hour')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { delay: value })}
                      >
                        <SelectTrigger className="glass-input mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="15 minutes">15 minutes</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="1 day">1 day</SelectItem>
                        </SelectContent>
                      </Select>
                      {!selectedNode.data.delay && (
                        <p className="text-xs text-amber-400 mt-1">Required to delay execution.</p>
                      )}
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'condition' && (
                    <div>
                      <Label className="text-glass-text">Condition</Label>
                      <Input
                        value={String(selectedNode.data.conditionExpr || '')}
                        onChange={(e) => updateNodeData(selectedNode.id, { conditionExpr: e.target.value })}
                        placeholder="e.g., total_spent > 50"
                        className="glass-input mt-1"
                      />
                      <p className="text-xs text-gray-400 mt-1">Connections must use Yes/No handles.</p>
                      {!selectedNode.data.conditionExpr && (
                        <p className="text-xs text-amber-400 mt-1">Condition expression is required.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Node Configuration Dialog */}
          <Dialog 
            open={nodeDialogOpen} 
            onOpenChange={(open) => {
              setNodeDialogOpen(open);
              if (!open) setSelectedNode(null);
            }}
          >
            <DialogContent className="glass-card max-w-md">
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
                      onClick={() => selectedNode && removeNodeById(selectedNode.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Input
                    value={String(selectedNode.data.label || '')}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    className="glass-input"
                  />

                  {selectedNode.data.nodeType === 'trigger' && (
                    <div>
                      <Label className="text-glass-text">Trigger Type</Label>
                      <Select
                        value={String(selectedNode.data.triggerType || '')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { triggerType: value })}
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

                      {selectedNode.data.triggerType === 'meal_plan_received' && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <Label className="text-glass-text">Webhook URL</Label>
                            <div className="flex items-center gap-2">
                              <Input value={webhookUrl} readOnly className="glass-input" />
                              <Button
                                type="button"
                                variant="outline"
                                className="glass-button-outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(webhookUrl);
                                  toast({ title: 'Copied', description: 'Webhook URL copied to clipboard' });
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs text-gray-400 break-all">POST JSON to this URL. Include header X-Signature = HMAC-SHA256(secret, raw body).</p>
                          </div>

                          <div>
                            <Label className="text-glass-text">Webhook Secret</Label>
                            <Input
                              value={String(selectedNode.data.webhookSecret || '')}
                              onChange={(e) => updateNodeData(selectedNode.id, { webhookSecret: e.target.value })}
                              placeholder="Shared secret for signature verification"
                              className="glass-input"
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-glass-text">Customer Email Field</Label>
                              <Input
                                value={String(selectedNode.data.mapEmailField || 'email')}
                                onChange={(e) => updateNodeData(selectedNode.id, { mapEmailField: e.target.value })}
                                placeholder="email"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label className="text-glass-text">Customer Name Field</Label>
                              <Input
                                value={String(selectedNode.data.mapNameField || 'name')}
                                onChange={(e) => updateNodeData(selectedNode.id, { mapNameField: e.target.value })}
                                placeholder="name"
                                className="glass-input"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Backend accepts JSON payload; set which fields contain the customer's email and name. Meal plan content/URL will be handled server-side.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'action' && (
                    <div>
                      <Label className="text-glass-text">Action Type</Label>
                      <Select
                        value={String(selectedNode.data.actionType || '')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { actionType: value })}
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

                      {selectedNode.data.actionType === 'send_meal_plan' && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <Label className="text-glass-text">Target Tag</Label>
                            <Select
                              value={String(selectedNode.data.mealPlanTagId || '')}
                              onValueChange={(value) => updateNodeData(selectedNode.id, { mealPlanTagId: value })}
                            >
                              <SelectTrigger className="glass-input">
                                <SelectValue placeholder="Select customer tag" />
                              </SelectTrigger>
                              <SelectContent className="glass-card max-h-64 overflow-auto">
                                {availableTags.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-glass-text">Email Subject</Label>
                            <Input
                              value={String(selectedNode.data.mealPlanSubject || '')}
                              onChange={(e) => updateNodeData(selectedNode.id, { mealPlanSubject: e.target.value })}
                              placeholder="e.g., Your Weekly Meal Plan"
                              className="glass-input"
                            />
                          </div>

                          <div>
                            <Label className="text-glass-text">Email Body (supports {'{{name}}'})</Label>
                            <textarea
                              value={String(selectedNode.data.mealPlanBody || '')}
                              onChange={(e) => updateNodeData(selectedNode.id, { mealPlanBody: e.target.value })}
                              placeholder="Hi {{name}}, please find your meal plan attached."
                              className="glass-input w-full min-h-[120px] p-3 bg-transparent border rounded-md"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-glass-text">Meal Plan PDF (optional)</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadMealPlanFile(f);
                                }}
                                className="block text-sm"
                              />
                              {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
                            </div>
                            {Boolean((selectedNode as any)?.data?.mealPlanPdfPath)
                              ? (
                                <div className="text-xs text-gray-300 break-all">
                                  Path: {String((selectedNode as any).data.mealPlanPdfPath)}
                                </div>
                              )
                              : null}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'delay' && (
                    <div>
                      <Label className="text-glass-text">Delay Duration</Label>
                      <Select
                        value={String(selectedNode.data.delay || '1 hour')}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { delay: value })}
                      >
                        <SelectTrigger className="glass-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="15 minutes">15 minutes</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="1 day">1 day</SelectItem>
                          <SelectItem value="1 week">1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
      </ReactFlowProvider>
    </WorkflowErrorBoundary>
  );
};