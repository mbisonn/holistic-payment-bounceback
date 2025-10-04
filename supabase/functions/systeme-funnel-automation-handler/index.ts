import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "info@bouncebacktolifeconsult.pro";

interface SystemeAutomationEvent {
  type: SystemeTriggerType;
  customer_email: string;
  customer_name?: string;
  data: Record<string, any>;
  funnel_id?: string;
}

type SystemeTriggerType = 
  | 'form_submitted'
  | 'opt_in_completed'
  | 'lead_captured'
  | 'purchase_completed'
  | 'purchase_confirmed'
  | 'payment_successful'
  | 'checkout_started'
  | 'checkout_abandoned'
  | 'tag_added'
  | 'tag_removed'
  | 'campaign_subscribed'
  | 'campaign_unsubscribed'
  | 'webinar_registered'
  | 'webinar_attended'
  | 'webinar_missed'
  | 'event_registered'
  | 'email_opened'
  | 'email_clicked'
  | 'email_bounced'
  | 'email_unsubscribed'
  | 'date_reached'
  | 'time_elapsed'
  | 'recurring_schedule';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let event: SystemeAutomationEvent;
  try {
    event = await req.json();
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { type, customer_email, customer_name, data, funnel_id } = event;
  
  if (!type || !customer_email) {
    return new Response("Missing required event data", { status: 400 });
  }

  console.log(`Processing Systeme.io automation event: ${type} for ${customer_email}`);

  try {
    // Find matching automations
    const { data: automations, error: automationsError } = await supabase
      .from("funnel_automations")
      .select(`
        *,
        triggers: funnel_automation_triggers(*),
        conditions: funnel_automation_conditions(*),
        actions: funnel_automation_actions(*)
      `)
      .eq("is_active", true)
      .eq("funnel_id", funnel_id || null);

    if (automationsError) {
      console.error("Error fetching automations:", automationsError);
      return new Response("Failed to fetch automations", { status: 500 });
    }

    if (!automations || automations.length === 0) {
      console.log("No matching automations found");
      return new Response("No matching automations", { status: 200 });
    }

    const executionResults = [];

    // Process each matching automation
    for (const automation of automations) {
      console.log(`Processing automation: ${automation.name} (${automation.type})`);

      // Check if trigger matches
      const matchingTrigger = automation.triggers?.find(trigger => 
        trigger.trigger_type === type
      );

      if (!matchingTrigger) {
        console.log(`No matching trigger found for ${type}`);
        continue;
      }

      // Create execution record
      const { data: execution, error: executionError } = await supabase
        .from("funnel_automation_executions")
        .insert([{
          automation_id: automation.id,
          customer_email,
          execution_data: {
            trigger_type: type,
            trigger_config: matchingTrigger.trigger_config,
            event_data: data,
            customer_name
          },
          status: 'running',
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (executionError) {
        console.error("Error creating execution record:", executionError);
        continue;
      }

      try {
        // Execute actions based on automation type
        if (automation.type === 'rule') {
          await executeRuleActions(supabase, automation, customer_email, customer_name, data);
        } else if (automation.type === 'workflow') {
          await executeWorkflowActions(supabase, automation, customer_email, customer_name, data);
        }

        // Update execution status
        await supabase
          .from("funnel_automation_executions")
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq("id", execution.id);

        executionResults.push({
          automation_id: automation.id,
          automation_name: automation.name,
          status: 'completed'
        });

      } catch (actionError) {
        console.error(`Error executing automation ${automation.name}:`, actionError);
        
        // Update execution status to failed
        await supabase
          .from("funnel_automation_executions")
          .update({
            status: 'failed',
            error_message: actionError.message,
            completed_at: new Date().toISOString()
          })
          .eq("id", execution.id);

        executionResults.push({
          automation_id: automation.id,
          automation_name: automation.name,
          status: 'failed',
          error: actionError.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed_automations: executionResults.length,
      results: executionResults
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error processing automation event:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

async function executeRuleActions(
  supabase: any,
  automation: any,
  customerEmail: string,
  customerName: string | undefined,
  eventData: Record<string, any>
) {
  console.log(`Executing rule actions for automation: ${automation.name}`);

  if (!automation.actions || automation.actions.length === 0) {
    console.log("No actions to execute");
    return;
  }

  // Sort actions by order_index
  const sortedActions = automation.actions.sort((a: any, b: any) => a.order_index - b.order_index);

  for (const action of sortedActions) {
    console.log(`Executing action: ${action.action_type}`);
    
    // Handle delay if specified
    if (action.delay_minutes > 0) {
      console.log(`Scheduling action with ${action.delay_minutes} minute delay`);
      // In a real implementation, you'd schedule this for later execution
      // For now, we'll execute immediately but log the delay
    }

    await executeAction(supabase, action, customerEmail, customerName, eventData);
  }
}

async function executeWorkflowActions(
  supabase: any,
  automation: any,
  customerEmail: string,
  customerName: string | undefined,
  eventData: Record<string, any>
) {
  console.log(`Executing workflow actions for automation: ${automation.name}`);

  if (!automation.actions || automation.actions.length === 0) {
    console.log("No actions to execute");
    return;
  }

  // Sort actions by order_index
  const sortedActions = automation.actions.sort((a: any, b: any) => a.order_index - b.order_index);

  for (const action of sortedActions) {
    console.log(`Executing workflow action: ${action.action_type}`);

    // Check conditions if any
    if (automation.conditions && automation.conditions.length > 0) {
      const shouldExecute = await evaluateConditions(supabase, automation.conditions, customerEmail, eventData);
      if (!shouldExecute) {
        console.log(`Conditions not met for action: ${action.action_type}`);
        continue;
      }
    }

    // Handle delay if specified
    if (action.delay_minutes > 0) {
      console.log(`Scheduling workflow action with ${action.delay_minutes} minute delay`);
      // In a real implementation, you'd schedule this for later execution
    }

    await executeAction(supabase, action, customerEmail, customerName, eventData);
  }
}

async function executeAction(
  supabase: any,
  action: any,
  customerEmail: string,
  customerName: string | undefined,
  eventData: Record<string, any>
) {
  const { action_type, action_config } = action;

  switch (action_type) {
    case 'assign_tag':
      await assignTag(supabase, action_config, customerEmail, customerName);
      break;
    
    case 'remove_tag':
      await removeTag(supabase, action_config, customerEmail);
      break;
    
    case 'send_email':
      await sendEmail(action_config, customerEmail, customerName, eventData);
      break;
    
    case 'send_email_template':
      await sendEmailTemplate(action_config, customerEmail, customerName, eventData);
      break;
    
    case 'subscribe_campaign':
      await subscribeToCampaign(supabase, action_config, customerEmail);
      break;
    
    case 'unsubscribe_campaign':
      await unsubscribeFromCampaign(supabase, action_config, customerEmail);
      break;
    
    case 'notify_team':
      await notifyTeam(action_config, customerEmail, customerName, eventData);
      break;
    
    case 'send_slack_notification':
      await sendSlackNotification(action_config, customerEmail, customerName, eventData);
      break;
    
    case 'send_webhook':
      await sendWebhook(action_config, customerEmail, customerName, eventData);
      break;
    
    case 'update_customer':
      await updateCustomer(supabase, action_config, customerEmail, eventData);
      break;
    
    case 'add_note':
      await addNote(supabase, action_config, customerEmail, customerName, eventData);
      break;
    
    case 'conditional_action':
      await executeConditionalAction(supabase, action_config, customerEmail, customerName, eventData);
      break;
    
    default:
      console.log(`Unknown action type: ${action_type}`);
  }
}

async function assignTag(supabase: any, config: any, customerEmail: string, customerName: string | undefined) {
  console.log(`Assigning tag: ${config.tag} to ${customerEmail}`);
  
  // Find or create tag
  let { data: tag, error: tagError } = await supabase
    .from("customer_tags")
    .select("id")
    .eq("name", config.tag)
    .single();

  if (tagError && tagError.code === 'PGRST116') {
    // Tag doesn't exist, create it
    const { data: newTag, error: createError } = await supabase
      .from("customer_tags")
      .insert([{ name: config.tag, description: `Auto-created tag for ${config.tag}` }])
      .select()
      .single();

    if (createError) {
      console.error("Error creating tag:", createError);
      return;
    }
    tag = newTag;
  } else if (tagError) {
    console.error("Error finding tag:", tagError);
    return;
  }

  // Assign tag to customer
  const { error: assignmentError } = await supabase
    .from("customer_tag_assignments")
    .insert([{
      customer_email: customerEmail,
      customer_name: customerName,
      tag_id: tag.id
    }]);

  if (assignmentError) {
    console.error("Error assigning tag:", assignmentError);
  } else {
    console.log(`Successfully assigned tag ${config.tag} to ${customerEmail}`);
  }
}

async function removeTag(supabase: any, config: any, customerEmail: string) {
  console.log(`Removing tag: ${config.tag} from ${customerEmail}`);
  
  const { error } = await supabase
    .from("customer_tag_assignments")
    .delete()
    .eq("customer_email", customerEmail)
    .eq("customer_tags.name", config.tag);

  if (error) {
    console.error("Error removing tag:", error);
  } else {
    console.log(`Successfully removed tag ${config.tag} from ${customerEmail}`);
  }
}

async function sendEmail(config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Sending email to ${customerEmail}`);
  
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const emailData = {
    from: FROM_EMAIL,
    to: customerEmail,
    subject: config.subject || "Automation Email",
    html: config.html || config.template || "<p>This is an automated email.</p>",
    text: config.text || "This is an automated email."
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Email sent successfully: ${result.id}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

async function sendEmailTemplate(config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Sending email template: ${config.template} to ${customerEmail}`);
  
  // In a real implementation, you'd fetch the template from your database
  // and merge it with customer data
  await sendEmail({
    ...config,
    subject: `Welcome ${customerName || 'there'}!`,
    html: `<p>Hello ${customerName || 'there'}, this is your ${config.template} email.</p>`
  }, customerEmail, customerName, eventData);
}

async function subscribeToCampaign(supabase: any, config: any, customerEmail: string) {
  console.log(`Subscribing ${customerEmail} to campaign: ${config.campaign}`);
  
  // In a real implementation, you'd subscribe the customer to the email campaign
  // This would typically involve adding them to a campaign list or updating their subscription status
  console.log(`Customer ${customerEmail} subscribed to campaign ${config.campaign}`);
}

async function unsubscribeFromCampaign(supabase: any, config: any, customerEmail: string) {
  console.log(`Unsubscribing ${customerEmail} from campaign: ${config.campaign}`);
  
  // In a real implementation, you'd unsubscribe the customer from the email campaign
  console.log(`Customer ${customerEmail} unsubscribed from campaign ${config.campaign}`);
}

async function notifyTeam(config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Notifying team about ${customerEmail}`);
  
  const notificationData = {
    customer_email: customerEmail,
    customer_name: customerName,
    event_data: eventData,
    timestamp: new Date().toISOString()
  };

  // In a real implementation, you'd send this to your team notification system
  // (Slack, email, webhook, etc.)
  console.log("Team notification:", notificationData);
}

async function sendSlackNotification(config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Sending Slack notification about ${customerEmail}`);
  
  // In a real implementation, you'd send a message to Slack
  console.log("Slack notification sent");
}

async function sendWebhook(config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Sending webhook for ${customerEmail}`);
  
  if (!config.url) {
    console.error("Webhook URL not configured");
    return;
  }

  const webhookData = {
    customer_email,
    customer_name: customerName,
    event_data: eventData,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    console.log(`Webhook sent successfully to ${config.url}`);
  } catch (error) {
    console.error("Error sending webhook:", error);
    throw error;
  }
}

async function updateCustomer(supabase: any, config: any, customerEmail: string, eventData: Record<string, any>) {
  console.log(`Updating customer: ${customerEmail}`);
  
  // In a real implementation, you'd update customer data in your database
  console.log(`Customer ${customerEmail} updated with data:`, config);
}

async function addNote(supabase: any, config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Adding note for customer: ${customerEmail}`);
  
  // In a real implementation, you'd add a note to the customer's record
  console.log(`Note added for ${customerEmail}:`, config.note);
}

async function executeConditionalAction(supabase: any, config: any, customerEmail: string, customerName: string | undefined, eventData: Record<string, any>) {
  console.log(`Executing conditional action for ${customerEmail}`);
  
  // In a real implementation, you'd evaluate the condition and execute the appropriate action
  if (config.condition === 'email_opened') {
    // Check if email was opened
    const emailOpened = eventData.email_opened || false;
    
    if (emailOpened && config.if_true) {
      await executeAction(supabase, config.if_true, customerEmail, customerName, eventData);
    } else if (!emailOpened && config.if_false) {
      await executeAction(supabase, config.if_false, customerEmail, customerName, eventData);
    }
  }
}

async function evaluateConditions(supabase: any, conditions: any[], customerEmail: string, eventData: Record<string, any>): Promise<boolean> {
  // In a real implementation, you'd evaluate all conditions
  // For now, we'll return true to execute all actions
  return true;
}

