import { supabase } from '@/integrations/supabase/client';
import { getTriggerById } from '@/components/admin/automations/triggers/TriggerDefinitions';
import AutomationExecutor from './AutomationExecutor';

export interface AutomationEvent {
  id: string;
  triggerType: string;
  triggerData: Record<string, any>;
  context: {
    customerId?: string;
    orderId?: string;
    productId?: string;
    userId?: string;
    timestamp: Date;
  };
  metadata?: Record<string, any>;
}

export interface EventSubscription {
  id: string;
  triggerType: string;
  automationId: string;
  conditions?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export class EventEmitter {
  private static instance: EventEmitter;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventQueue: AutomationEvent[] = [];
  private isProcessing = false;
  private automationExecutor: AutomationExecutor;

  private constructor() {
    this.automationExecutor = AutomationExecutor.getInstance();
    this.startEventProcessor();
    this.loadSubscriptions();
  }

  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  /**
   * Emit an automation event
   */
  public async emitEvent(
    triggerType: string,
    triggerData: Record<string, any>,
    context: {
      customerId?: string;
      orderId?: string;
      productId?: string;
      userId?: string;
    }
  ): Promise<void> {
    const event: AutomationEvent = {
      id: this.generateEventId(),
      triggerType,
      triggerData,
      context: {
        ...context,
        timestamp: new Date()
      }
    };

    // Add to queue
    this.eventQueue.push(event);

    // Log event
    await this.logEvent(event);

    console.log(`Event emitted: ${triggerType}`, event);
  }

  /**
   * Subscribe to automation events
   */
  public async subscribeToEvent(
    triggerType: string,
    automationId: string,
    conditions?: Record<string, any>
  ): Promise<string> {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      triggerType,
      automationId,
      conditions,
      isActive: true,
      createdAt: new Date()
    };

    // Add to subscriptions map
    if (!this.subscriptions.has(triggerType)) {
      this.subscriptions.set(triggerType, []);
    }
    this.subscriptions.get(triggerType)!.push(subscription);

    // Save to database
    await this.saveSubscription(subscription);

    console.log(`Subscribed to event: ${triggerType} for automation: ${automationId}`);
    return subscription.id;
  }

  /**
   * Unsubscribe from automation events
   */
  public async unsubscribeFromEvent(subscriptionId: string): Promise<void> {
    // Remove from subscriptions map
    for (const [triggerType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        break;
      }
    }

    // Remove from database
    await this.removeSubscription(subscriptionId);

    console.log(`Unsubscribed from event: ${subscriptionId}`);
  }

  /**
   * Process events from the queue
   */
  private async startEventProcessor(): Promise<void> {
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        await this.processNextEvent();
      }
    }, 500); // Check every 500ms
  }

  /**
   * Process the next event in the queue
   */
  private async processNextEvent(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const event = this.eventQueue.shift();
    if (!event) return;

    this.isProcessing = true;

    try {
      await this.handleEvent(event);
    } catch (error) {
      console.error('Error processing event:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle a single event
   */
  private async handleEvent(event: AutomationEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(event.triggerType) || [];
    
    for (const subscription of subscriptions) {
      if (!subscription.isActive) continue;

      // Check conditions if any
      if (subscription.conditions && !this.evaluateConditions(event, subscription.conditions)) {
        continue;
      }

      // Get automation details
      const automation = await this.getAutomation(subscription.automationId);
      if (!automation || !automation.is_active) continue;

      // Execute automation
      await this.executeAutomation(automation, event);
    }
  }

  /**
   * Evaluate event conditions
   */
  private evaluateConditions(event: AutomationEvent, conditions: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = this.getNestedValue(event.triggerData, key);
      
      if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Execute automation for an event
   */
  private async executeAutomation(automation: any, event: AutomationEvent): Promise<void> {
    try {
      // Get automation actions
      const actions = await this.getAutomationActions(automation.id);
      
      for (const action of actions) {
        await this.automationExecutor.executeAction(
          automation.id,
          action.action_type,
          action.action_config,
          {
            customerId: event.context.customerId,
            orderId: event.context.orderId,
            productId: event.context.productId,
            triggerData: event.triggerData,
            executionData: event.context
          }
        );
      }
    } catch (error) {
      console.error('Error executing automation:', error);
    }
  }

  /**
   * Load subscriptions from database
   */
  private async loadSubscriptions(): Promise<void> {
    try {
      const { data: automations, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      for (const automation of automations || []) {
        const subscription: EventSubscription = {
          id: automation.id,
          triggerType: automation.trigger,
          automationId: automation.id,
          conditions: automation.trigger_data,
          isActive: automation.is_active,
          createdAt: new Date(automation.created_at)
        };

        if (!this.subscriptions.has(automation.trigger)) {
          this.subscriptions.set(automation.trigger, []);
        }
        this.subscriptions.get(automation.trigger)!.push(subscription);
      }

      console.log('Loaded subscriptions:', this.subscriptions.size);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }

  /**
   * Save subscription to database
   */
  private async saveSubscription(subscription: EventSubscription): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({
          trigger_data: subscription.conditions,
          is_active: subscription.isActive
        })
        .eq('id', subscription.automationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  /**
   * Remove subscription from database
   */
  private async removeSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing subscription:', error);
    }
  }

  /**
   * Get automation by ID
   */
  private async getAutomation(automationId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', automationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting automation:', error);
      return null;
    }
  }

  /**
   * Get automation actions
   */
  private async getAutomationActions(automationId: string): Promise<any[]> {
    try {
      // For now, return a single action based on the automation rule
      const automation = await this.getAutomation(automationId);
      if (!automation) return [];

      return [{
        action_type: automation.action,
        action_config: automation.action_data
      }];
    } catch (error) {
      console.error('Error getting automation actions:', error);
      return [];
    }
  }

  /**
   * Log event to database
   */
  private async logEvent(event: AutomationEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_events')
        .insert([{
          id: event.id,
          trigger_type: event.triggerType,
          trigger_data: event.triggerData,
          context: event.context,
          metadata: event.metadata,
          created_at: event.context.timestamp.toISOString()
        }]);

      if (error) {
        console.error('Error logging event:', error);
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event statistics
   */
  public getEventStats(): {
    totalEvents: number;
    queuedEvents: number;
    activeSubscriptions: number;
    subscriptionsByTrigger: Record<string, number>;
  } {
    const subscriptionsByTrigger: Record<string, number> = {};
    let activeSubscriptions = 0;

    for (const [triggerType, subscriptions] of this.subscriptions.entries()) {
      const activeCount = subscriptions.filter(sub => sub.isActive).length;
      subscriptionsByTrigger[triggerType] = activeCount;
      activeSubscriptions += activeCount;
    }

    return {
      totalEvents: this.eventQueue.length,
      queuedEvents: this.eventQueue.length,
      activeSubscriptions,
      subscriptionsByTrigger
    };
  }

  /**
   * Clear event queue (for testing)
   */
  public clearEventQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get recent events
   */
  public async getRecentEvents(limit: number = 50): Promise<AutomationEvent[]> {
    try {
      const { data, error } = await supabase
        .from('automation_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(event => ({
        id: event.id,
        triggerType: event.trigger_type,
        triggerData: event.trigger_data,
        context: {
          ...event.context,
          timestamp: new Date(event.created_at)
        },
        metadata: event.metadata
      }));
    } catch (error) {
      console.error('Error getting recent events:', error);
      return [];
    }
  }
}

export default EventEmitter;
