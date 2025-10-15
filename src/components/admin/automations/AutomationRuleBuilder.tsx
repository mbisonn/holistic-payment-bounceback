import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StepSelectionModal from './StepSelectionModal';
import { 
  Save, 
  Pause, 
  Play, 
  ArrowRight, 
  Plus,
  X,
  Zap,
  Settings,
  Tag,
  Mail,
  User,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  Clock,
  Filter,
  Target,
  Gift,
  Database,
  GraduationCap,
  Video,
  FileText,
  CreditCard,
  XCircle
} from 'lucide-react';

interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  trigger_data: any;
  action_data: any;
  is_active: boolean;
}

interface AutomationRuleBuilderProps {
  rule?: AutomationRule;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
}

const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  // Triggers
  tag_added: Tag,
  tag_removed: Tag,
  funnel_form_subscribed: FileText,
  blog_form_subscribed: FileText,
  digital_store_form_subscribed: ShoppingCart,
  campaign_completed: CheckCircle,
  registered_to_webinar: Video,
  enrolled_in_course: GraduationCap,
  new_sale: CreditCard,
  
  // Actions
  subscribe_to_campaign: Mail,
  unsubscribe_from_campaign: Mail,
  add_tag: Tag,
  remove_tag: Tag,
  send_email: Mail,
  send_email_to_specific: Mail,
  enroll_in_course: GraduationCap,
  revoke_course_access: GraduationCap,
  
  // Decisions
  has_tag: Tag,
  purchase_value: CreditCard,
  customer_segment: User,
  order_count: ShoppingCart,
  
  // Delays
  wait_minutes: Clock,
  wait_hours: Clock,
  wait_days: Clock,
  wait_weeks: Clock
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  // Triggers
  tag_added: 'Occurs when a tag has been added to a contact',
  tag_removed: 'Occurs when a tag has been removed from a contact',
  funnel_form_subscribed: 'Occurs when a contact has just subscribed through a form',
  blog_form_subscribed: 'Occurs when a contact has just subscribed through a blog form',
  digital_store_form_subscribed: 'Occurs when a contact has just subscribed through a digital store \'Collect emails\' section',
  campaign_completed: 'Occurs when a contact has just completed a campaign',
  registered_to_webinar: 'Occurs when a contact has just registered to a webinar',
  enrolled_in_course: 'Occurs when a contact has just enrolled in a course',
  new_sale: 'Occurs when a customer makes a purchase',
  
  // Actions
  subscribe_to_campaign: 'Subscribe a contact to a campaign',
  unsubscribe_from_campaign: 'Unsubscribe a contact from a campaign',
  add_tag: 'Add a tag to a contact',
  remove_tag: 'Remove a tag from a contact',
  send_email: 'Send an email to a contact',
  send_email_to_specific: 'Send an email to a specific email address',
  enroll_in_course: 'Enroll a contact in a course',
  revoke_course_access: 'Unenrolls a contact from a course',
  
  // Decisions
  has_tag: 'Split the path based on whether contact has a specific tag',
  purchase_value: 'Split the path based on purchase amount',
  customer_segment: 'Split the path based on customer segment',
  order_count: 'Split the path based on number of orders',
  
  // Delays
  wait_minutes: 'Wait for specified minutes before continuing',
  wait_hours: 'Wait for specified hours before continuing',
  wait_days: 'Wait for specified days before continuing',
  wait_weeks: 'Wait for specified weeks before continuing'
};

export default function AutomationRuleBuilder({ 
  rule, 
  onSave, 
  onCancel 
}: AutomationRuleBuilderProps) {
  const [currentRule, setCurrentRule] = useState<AutomationRule>(
    rule || {
      name: '',
      description: '',
      trigger: '',
      action: '',
      trigger_data: {},
      action_data: {},
      is_active: true
    }
  );
  
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepModalType, setStepModalType] = useState<'action' | 'decision' | 'delay' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  const handleStepSelect = (stepType: 'action' | 'decision' | 'delay', stepId: string) => {
    if (stepType === 'action') {
      setCurrentRule(prev => ({ ...prev, action: stepId }));
    } else if (stepType === 'decision') {
      // For decisions, we might want to add them as additional steps
      // For now, we'll treat them as actions
      setCurrentRule(prev => ({ ...prev, action: stepId }));
    } else if (stepType === 'delay') {
      // For delays, we might want to add them as additional steps
      // For now, we'll treat them as actions
      setCurrentRule(prev => ({ ...prev, action: stepId }));
    }
  };

  const openStepModal = (type: 'action' | 'decision' | 'delay') => {
    setStepModalType(type);
    setStepModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentRule.name || !currentRule.trigger || !currentRule.action) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      onSave(currentRule);
      toast({
        title: 'Success',
        description: rule ? 'Automation rule updated successfully' : 'Automation rule created successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save automation rule',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStepIcon = (stepId: string) => {
    return STEP_ICONS[stepId] || Settings;
  };

  const getStepDescription = (stepId: string) => {
    return STEP_DESCRIPTIONS[stepId] || 'No description available';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Automation Rules</span>
              <span>›</span>
              <span className="text-gray-900 font-medium">
                {rule ? 'Edit automation rule' : 'Create automation rule'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentRule(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="flex items-center gap-2"
            >
              {currentRule.is_active ? (
                <>
                  <Pause className="h-4 w-4" />
                  Paused
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Active
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save rule'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Rule Name */}
          <div className="mb-6">
            <Label htmlFor="rule-name" className="text-sm font-medium text-gray-700">
              Rule Name
            </Label>
            <Input
              id="rule-name"
              value={currentRule.name}
              onChange={(e) => setCurrentRule(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter automation rule name..."
              className="mt-1"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trigger Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Trigger</h3>
                  <p className="text-sm text-gray-500">When this event happens...</p>
                </div>
              </div>

              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-6">
                  {currentRule.trigger ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          {React.createElement(getStepIcon(currentRule.trigger), { 
                            className: "h-5 w-5 text-blue-600" 
                          })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {currentRule.trigger.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {getStepDescription(currentRule.trigger)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentRule(prev => ({ ...prev, trigger: '' }))}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Trigger Configuration */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Funnel*
                          </Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose funnel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main-funnel">Main Funnel</SelectItem>
                              <SelectItem value="upsell-funnel">Upsell Funnel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button
                        variant="outline"
                        onClick={() => openStepModal('action')}
                        className="border-dashed border-2 border-gray-300 hover:border-blue-400 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add trigger
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Action</h3>
                  <p className="text-sm text-gray-500">...do this</p>
                </div>
              </div>

              <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                <CardContent className="p-6">
                  {currentRule.action ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          {React.createElement(getStepIcon(currentRule.action), { 
                            className: "h-5 w-5 text-green-600" 
                          })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {currentRule.action.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {getStepDescription(currentRule.action)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentRule(prev => ({ ...prev, action: '' }))}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Action Configuration */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Tag*
                          </Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose a tag or create a new one" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-customer">New Customer</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                              <SelectItem value="newsletter">Newsletter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button
                        variant="outline"
                        onClick={() => openStepModal('action')}
                        className="border-dashed border-2 border-gray-300 hover:border-green-400 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add action
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Steps */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Steps</h3>
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => openStepModal('decision')}
                className="h-20 border-dashed border-2 border-gray-300 hover:border-yellow-400 bg-transparent flex-col gap-2"
              >
                <Filter className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Add Decision</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => openStepModal('delay')}
                className="h-20 border-dashed border-2 border-gray-300 hover:border-purple-400 bg-transparent flex-col gap-2"
              >
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Add Delay</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => openStepModal('action')}
                className="h-20 border-dashed border-2 border-gray-300 hover:border-green-400 bg-transparent flex-col gap-2"
              >
                <Settings className="h-5 w-5 text-green-600" />
                <span className="text-sm">Add Action</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

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
