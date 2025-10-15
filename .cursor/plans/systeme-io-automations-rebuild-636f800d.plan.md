<!-- 636f800d-b1e8-48a6-b3b1-57dea8ac05f5 21d7d41f-be8c-406c-844a-9151ff688424 -->
# Connect All Dashboard Categories to Automations System

## Overview

Integrate all 17 dashboard sections with the automations system to enable automated workflows across the entire platform. Each category will have specific triggers (events that start automations) and actions (things automations can do).

## Dashboard Categories to Connect

1. **Products** - Product events and inventory management
2. **Orders** - Order lifecycle and fulfillment
3. **Customers** - Customer behavior and profile changes
4. **Upsells/Downsells** - Purchase enhancement triggers
5. **Order Bumps** - Add-on product actions
6. **Tags** - Customer segmentation
7. **Reputation** - Review and rating triggers
8. **WhatsApp** - Messaging automation
9. **Analytics** - Data-driven triggers
10. **Email Campaigns** - Email marketing automation
11. **Email Outbox** - Email delivery tracking
12. **Meal Plan Sync** - Custom integration
13. **Discounts** - Promotional automation
14. **Settings** - Configuration changes
15. **User Center** - Admin and user management

## Implementation Strategy

### Phase 1: Expand Trigger System

**File: `src/components/admin/automations/triggers/TriggerDefinitions.ts`**

Create comprehensive trigger definitions organized by category:

**Products Triggers:**

- Product Created
- Product Updated
- Product Deleted
- Product Stock Low (threshold-based)
- Product Stock Out
- Product Price Changed
- Product Activated/Deactivated
- Product Category Changed

**Orders Triggers:**

- Order Created
- Order Confirmed
- Order Processing
- Order Shipped
- Order Delivered
- Order Cancelled
- Order Refunded
- Order Payment Failed
- Order Payment Completed
- Order Status Changed

**Customer Triggers:**

- Customer Registered
- Customer Profile Updated
- Customer First Purchase
- Customer Nth Purchase (milestone)
- Customer Inactive (X days)
- Customer Birthday
- Customer Anniversary
- Customer VIP Status Reached
- Customer Spent Over Amount

**Upsell/Downsell Triggers:**

- Upsell Offered
- Upsell Accepted
- Upsell Declined
- Downsell Offered
- Downsell Accepted
- Downsell Declined

**Order Bump Triggers:**

- Order Bump Shown
- Order Bump Added
- Order Bump Removed

**Tag Triggers:**

- Tag Added to Customer
- Tag Removed from Customer
- Tag Created
- Tag Deleted

**Reputation Triggers:**

- Review Submitted
- Review Approved
- Review Rejected
- Rating Received
- Rating Above Threshold
- Rating Below Threshold
- Negative Review Alert

**WhatsApp Triggers:**

- WhatsApp Message Sent
- WhatsApp Message Delivered
- WhatsApp Message Read
- WhatsApp Message Failed
- WhatsApp Reply Received

**Email Triggers:**

- Email Campaign Sent
- Email Opened
- Email Clicked
- Email Bounced
- Email Unsubscribed
- Email Replied
- Email Delivered
- Email Failed

**Discount Triggers:**

- Discount Code Created
- Discount Code Used
- Discount Code Expired
- Discount Code Limit Reached

**Analytics Triggers:**

- Sales Milestone Reached
- Revenue Target Hit
- Daily Goal Achieved
- Traffic Spike Detected
- Conversion Rate Changed

### Phase 2: Expand Action System

**File: `src/components/admin/automations/actions/ActionDefinitions.ts`**

Create comprehensive action definitions:

**Product Actions:**

- Create Product
- Update Product
- Delete Product
- Adjust Product Price
- Update Stock Quantity
- Activate/Deactivate Product
- Duplicate Product
- Add Product to Category

**Order Actions:**

- Create Order
- Update Order Status
- Cancel Order
- Process Refund
- Send Order Confirmation
- Send Shipping Notification
- Send Delivery Confirmation
- Add Order Note
- Apply Discount to Order

**Customer Actions:**

- Create Customer
- Update Customer Profile
- Add Customer Note
- Assign Customer Segment
- Calculate Customer LTV
- Mark as VIP
- Add to Loyalty Program
- Send Customer Notification

**Tag Actions:**

- Add Tag
- Remove Tag
- Create New Tag
- Delete Tag
- Bulk Tag Assignment
- Conditional Tag Assignment

**Email Actions:**

- Send Email
- Send Email Campaign
- Subscribe to Campaign
- Unsubscribe from Campaign
- Send Transactional Email
- Schedule Email
- Send Email to Specific Address
- Send Email to Segment

**WhatsApp Actions:**

- Send WhatsApp Message
- Send WhatsApp Template
- Send WhatsApp Media
- Send WhatsApp Location
- Send WhatsApp Contact
- Add to WhatsApp Broadcast List

**Upsell/Downsell Actions:**

- Offer Upsell
- Offer Downsell
- Apply Upsell Discount
- Remove Upsell Offer

**Order Bump Actions:**

- Add Order Bump
- Remove Order Bump
- Show Order Bump Offer
- Hide Order Bump Offer

**Discount Actions:**

- Create Discount Code
- Activate Discount
- Deactivate Discount
- Apply Discount to Customer
- Send Discount Code
- Extend Discount Expiry

**Reputation Actions:**

- Send Review Request
- Approve Review
- Reject Review
- Respond to Review
- Hide Review
- Flag Review for Moderation

**Notification Actions:**

- Send Internal Notification
- Send Admin Alert
- Create Task
- Send Slack Message
- Send Discord Notification
- Log to System

**Analytics Actions:**

- Track Custom Event
- Update Metric
- Generate Report
- Send Analytics Summary
- Export Data

### Phase 3: Database Event Hooks

**File: `supabase/migrations/YYYYMMDD_automation_event_hooks.sql`**

Create PostgreSQL triggers for real-time event detection:

```sql
-- Orders table triggers
CREATE OR REPLACE FUNCTION notify_order_event() RETURNS trigger AS $$
BEGIN
  -- Fire automation based on order status
  PERFORM execute_automations('order_' || NEW.status, row_to_json(NEW)::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Products table triggers
CREATE OR REPLACE FUNCTION notify_product_event() RETURNS trigger AS $$
BEGIN
  -- Fire automation based on product changes
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automations('product_created', row_to_json(NEW)::jsonb);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM execute_automations('product_updated', row_to_json(NEW)::jsonb);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM execute_automations('product_deleted', row_to_json(OLD)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Phase 4: Integration Services

**File: `src/services/automation/AutomationExecutor.ts`**

Central service to execute automation actions:

- Handle trigger events from all categories
- Queue automation executions
- Execute actions with proper error handling
- Log all automation activities
- Track success/failure rates
- Handle retries for failed actions

**File: `src/services/automation/EventEmitter.ts`**

Event bus for real-time automation triggers:

- Emit events when dashboard actions occur
- Subscribe to category-specific events
- Filter and route events to automations
- Batch events for efficiency
- Rate limit event processing

### Phase 5: UI Integration in Each Category

Add automation triggers to each dashboard section:

**Products Management:**

- "Create Automation" button on product list
- Quick automation from product details
- Bulk automation for selected products

**Orders Management:**

- Order status change triggers
- Payment automation
- Fulfillment automation

**Customer Management:**

- Customer lifecycle automations
- Segmentation-based automations
- Behavior-triggered automations

**Tags Section:**

- Tag-based automation rules
- Auto-tagging based on behavior
- Tag removal automations

**Email Campaigns:**

- Campaign automation workflows
- Email sequence automation
- Engagement-based triggers

**Reputation:**

- Auto-request reviews after purchase
- Response automation
- Rating-based actions

**WhatsApp:**

- Message automation
- Template-based workflows
- Response automation

**Discounts:**

- Auto-apply discount rules
- Expiration notifications
- Usage-based triggers

### Phase 6: Enhanced Trigger Modal

**Update: `src/components/admin/automations/StepSelectionModal.tsx`**

Add all new triggers organized by category:

- Collapsible category sections
- Icon for each trigger type
- Search and filter functionality
- Recently used triggers
- Popular triggers section

### Phase 7: Enhanced Action Modal

**Update: `src/components/admin/automations/StepSelectionModal.tsx`**

Add all new actions organized by category:

- Configuration forms for each action
- Field validation
- Preview of action effect
- Test action functionality

### Phase 8: Automation Templates

**File: `src/components/admin/automations/templates/AutomationTemplates.ts`**

Pre-built templates for common scenarios:

1. **Welcome Series** - Customer registration → Email sequence
2. **Abandoned Cart** - Cart idle 1 hour → Email reminder
3. **Order Confirmation** - Order created → Email + WhatsApp
4. **Shipping Update** - Order shipped → Customer notification
5. **Review Request** - Order delivered 3 days → Review email
6. **Low Stock Alert** - Stock < 10 → Admin notification
7. **VIP Customer** - Spent > $1000 → VIP tag + discount
8. **Birthday Campaign** - Customer birthday → Special offer
9. **Win-back Campaign** - Inactive 30 days → Re-engagement
10. **Upsell Sequence** - Purchase product A → Offer product B
11. **Refund Process** - Refund requested → Admin alert + customer email
12. **Price Drop Alert** - Product price reduced → Notify interested customers

### Phase 9: Automation Dashboard Widget

**File: `src/components/dashboard/AutomationDashboardWidget.tsx`**

Add automation insights to main dashboard:

- Active automations count
- Recent automation executions
- Success rate metrics
- Quick create buttons
- Automation health status

### Phase 10: Testing and Monitoring

**File: `src/components/admin/automations/AutomationMonitor.tsx`**

Real-time monitoring interface:

- Live automation execution log
- Filter by category
- Success/failure analytics
- Performance metrics
- Error tracking and alerts

## Files to Create/Modify

### New Files:

1. `src/components/admin/automations/triggers/TriggerDefinitions.ts`
2. `src/components/admin/automations/actions/ActionDefinitions.ts`
3. `src/services/automation/AutomationExecutor.ts`
4. `src/services/automation/EventEmitter.ts`
5. `src/services/automation/TriggerHandlers.ts`
6. `src/services/automation/ActionHandlers.ts`
7. `src/components/admin/automations/templates/AutomationTemplates.ts`
8. `src/components/dashboard/AutomationDashboardWidget.tsx`
9. `src/components/admin/automations/AutomationMonitor.tsx`
10. `supabase/migrations/YYYYMMDD_automation_event_hooks.sql`

### Modified Files:

1. `src/components/admin/automations/StepSelectionModal.tsx` - Add all triggers/actions
2. `src/components/admin/automations/SystemeStyleAutomations.tsx` - Add templates
3. `src/components/dashboard/ProductsManagement.tsx` - Add automation integration
4. `src/components/dashboard/OrdersManagement.tsx` - Add automation integration
5. `src/components/dashboard/CustomersManagement.tsx` - Add automation integration
6. `src/components/dashboard/TagsSection.tsx` - Add automation integration
7. All other dashboard sections for automation integration

## Integration Points

Each dashboard category will have:

- **Trigger Points** - Where events are emitted
- **Action Handlers** - What automations can do to that category
- **UI Widgets** - Quick automation creation from category
- **Analytics** - Track automation performance per category

## Benefits

✅ **End-to-end automation** across entire platform

✅ **Reduced manual work** for repetitive tasks

✅ **Better customer experience** with timely communications

✅ **Increased sales** through upsells and targeted offers

✅ **Improved efficiency** with automated workflows

✅ **Data-driven actions** based on analytics triggers

✅ **Omnichannel communication** (Email + WhatsApp)

✅ **Scalable** architecture for future expansion

### To-dos

- [ ] Create StepSelectionModal component with Action/Decision/Delay options matching systeme.io design
- [ ] Create AutomationRuleBuilder component with two-column trigger-action layout
- [ ] Create SystemeStyleAutomations main component with list view and create functionality
- [ ] Simplify SystemeWorkflowBuilder canvas to match systeme.io's clean interface
- [ ] Update SystemeAutomationsRevamped to use new systeme-style components
- [ ] Expand trigger and action options to match systeme.io's offerings
- [ ] Apply systeme.io color scheme, typography, and visual design throughout