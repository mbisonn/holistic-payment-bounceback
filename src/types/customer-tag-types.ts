
export interface CustomerTag {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TagAssignment {
  id: string;
  customer_email: string;
  customer_name?: string;
  tag_id: string | null;
  created_at: string;
  assigned_at?: string;
}

// Comprehensive trigger types based on your system and GoHighLevel-style automation
export type AutomationTrigger =
  // E-commerce Triggers
  | 'purchase_paystack'
  | 'payment_on_delivery'
  | 'upsell_purchase'
  | 'downsell_purchase'
  | 'abandoned_cart'
  | 'meal_plan_signup'
  
  // Customer Behavior Triggers
  | 'customer_signup'
  | 'customer_login'
  | 'profile_updated'
  | 'birthday'
  | 'anniversary'
  
  // Email & Communication Triggers
  | 'email_opened'
  | 'email_clicked'
  | 'email_bounced'
  | 'email_unsubscribed'
  
  // Website Activity Triggers
  | 'page_visited'
  | 'link_clicked'
  | 'form_submitted'
  | 'search_performed'
  
  // Time-based Triggers
  | 'date_time'
  | 'recurring'
  | 'after_purchase'
  | 'after_signup'
  
  // Workflow Triggers
  | 'workflow';

// Comprehensive action types based on your system and GoHighLevel-style automation
export type AutomationAction =
  // Email Actions
  | 'send_email'
  | 'send_email_campaign'
  | 'send_welcome_email'
  | 'send_follow_up'
  | 'send_abandoned_cart_email'
  
  // SMS Actions
  | 'send_sms'
  | 'send_sms_campaign'
  | 'send_sms_reminder'
  
  // Tag Management Actions
  | 'assign_tag'
  | 'remove_tag'
  | 'add_to_segment'
  | 'remove_from_segment'
  
  // Task & Pipeline Actions
  | 'create_task'
  | 'assign_task'
  | 'move_pipeline'
  | 'create_deal'
  
  // Integration Actions
  | 'webhook'
  | 'api_call'
  | 'zapier_trigger'
  
  // Customer Actions
  | 'add_note'
  | 'update_customer'
  | 'create_opportunity'
  
  // Workflow Actions
  | 'execute_workflow';

// New types for enhanced workflow functionality
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'start';
  label: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
  data: any;
  connections: string[];
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowData {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  is_active: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  trigger_data?: any; // e.g. tag id, product id, workflow data, etc.
  action: AutomationAction;
  action_data?: any; // e.g. tag id, campaign id, etc.
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
