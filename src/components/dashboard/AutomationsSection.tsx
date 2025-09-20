import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import { AutomationRule, AutomationTrigger, AutomationAction } from '@/types/customer-tag-types';
import { VisualWorkflowBuilder } from '@/components/admin/workflow/VisualWorkflowBuilder';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';
import SystemeAutomationsComplete from '@/components/admin/automations/SystemeAutomationsComplete';

// Removed unused CustomerTag and EmailCampaign interfaces

const TRIGGER_OPTIONS: { value: AutomationTrigger; label: string }[] = [
  { value: 'purchase_paystack', label: 'Purchase (Paystack)' },
  { value: 'payment_on_delivery', label: 'Payment on Delivery' },
  { value: 'upsell_purchase', label: 'Upsell Purchase' },
  { value: 'downsell_purchase', label: 'Downsell Purchase' },
  { value: 'abandoned_cart', label: 'Abandoned Cart' },
  { value: 'meal_plan_signup', label: 'Meal Plan Signup' },
];

const ACTION_OPTIONS: { value: AutomationAction; label: string }[] = [
  { value: 'assign_tag', label: 'Assign Tag' },
  { value: 'send_email_campaign', label: 'Send Email Campaign' },
];

const AutomationsSection = () => {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  // Simple automation removed
  // const [showDialog, setShowDialog] = useState(false);
  // const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  // Simple automation form removed

  useEffect(() => {
    // Fire-and-forget; don't block render
    fetchAutomations();

    // Realtime sync: listen to changes on automation_rules and refresh the list
    const channel = supabase
      .channel('automation_rules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'automation_rules' },
        () => {
          fetchAutomations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fallback: when closing the workflow builder modal, refetch automations
  useEffect(() => {
    if (!workflowBuilderOpen) {
      fetchAutomations();
    }
  }, [workflowBuilderOpen]);

  const fetchAutomations = async () => {
    const stopGuard = startLoadingGuard(() => {}, 10000);
    try {
      // Only show workflows saved by the visual builder
      const res = await withTimeout(
        supabase
          .from('automation_rules')
          .select('*')
          .eq('trigger', 'workflow')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      setAutomations((data || []) as AutomationRule[]);
      setError(null);
    } catch (e: any) {
      // Non-fatal: empty list and inline error banner
      setAutomations([]);
      setError(e?.message || 'Failed to fetch automations');
    } finally {
      try { stopGuard(); } catch {}
    }
  };

  // Removed unused tag and campaign fetching helpers

  // Simple automation dialog removed

  // Simple automation save removed

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      const { error } = await supabase.from('automation_rules').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Automation deleted successfully' });
      fetchAutomations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete automation', variant: 'destructive' });
    }
  };

  const openAutomationTypeDialog = () => {
    // Directly open workflow builder (simple automation removed)
    setWorkflowBuilderOpen(true);
  };

  // Choice dialog no longer used

  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchAutomations(); }}>Retry</Button>
    </div>
  ) : null;

  return <SystemeAutomationsComplete />;
};

export default AutomationsSection;