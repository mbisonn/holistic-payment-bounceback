# Enhanced Workflow Builder Guide

## Overview
The Enhanced Workflow Builder is a GoHighLevel-style automation tool that allows you to create complex workflows using drag-and-drop functionality. It includes comprehensive triggers, actions, conditions, and delays based on your e-commerce and customer management system.

## Getting Started

### 1. Accessing the Workflow Builder
- Go to **Dashboard > Automations**
- Click **"Create Automation"**
- Select **"Visual Workflow Builder"**

### 2. Basic Workflow Structure
Every workflow starts with a **Start Node** and can include:
- **Triggers**: Events that start the workflow
- **Actions**: What happens when conditions are met
- **Conditions**: Logic gates that determine workflow flow
- **Delays**: Time-based pauses between actions

## Available Elements

### 🎯 Triggers
**E-commerce Triggers:**
- 🛒 Purchase (Paystack)
- 💳 Payment on Delivery
- 📈 Upsell Purchase
- 📉 Downsell Purchase
- 🛒💔 Cart Abandoned
- 🍽️ Meal Plan Signup

**Customer Behavior Triggers:**
- 👤 Customer Signup
- 🔑 Customer Login
- ✏️ Profile Updated
- 🎂 Customer Birthday
- 🎉 Customer Anniversary

**Email & Communication Triggers:**
- 📧👁️ Email Opened
- 📧🔗 Email Link Clicked
- 📧❌ Email Bounced
- 📧🚫 Email Unsubscribed

**Website Activity Triggers:**
- 🌐 Page Visited
- 🔗 Link Clicked
- 📝 Form Submitted
- 🔍 Search Performed

**Time-based Triggers:**
- ⏰ Date/Time
- 🔄 Recurring
- ⏱️ After Purchase
- ⏱️ After Signup

### ⚡ Actions
**Email Actions:**
- 📧 Send Email
- 📧📢 Send Email Campaign
- 📧👋 Send Welcome Email
- 📧📞 Send Follow-up
- 📧🛒 Send Abandoned Cart Email

**SMS Actions:**
- 💬 Send SMS
- 💬📢 Send SMS Campaign
- 💬⏰ Send SMS Reminder

**Tag Management Actions:**
- 🏷️ Assign Tag
- 🏷️❌ Remove Tag
- 👥 Add to Segment
- 👥❌ Remove from Segment

**Task & Pipeline Actions:**
- ✅ Create Task
- 👤 Assign Task
- 📊 Move in Pipeline
- 💼 Create Deal

**Integration Actions:**
- 🔗 Send Webhook
- 🌐 Make API Call
- ⚡ Zapier Trigger

**Customer Actions:**
- 📝 Add Customer Note
- ✏️ Update Customer
- 🎯 Create Opportunity

### 🔀 Conditions
**Customer Conditions:**
- 🏷️ Customer Has Tag
- 🏷️❌ Customer Hasn't Tag
- 👥 Customer in Segment
- 💰 Customer Value
- 🛒 Purchase Count
- 📅 Last Purchase Date

**Email Conditions:**
- 📧👁️ Email Opened
- 📧🔗 Email Clicked
- 📧❌ Email Bounced

**Order Conditions:**
- 💰 Order Value
- 📦 Order Contains Product
- 🚚 Shipping Method

**Time Conditions:**
- 🕐 Time of Day
- 📅 Day of Week
- 📅 Date Range

**Custom Conditions:**
- 🔧 Custom Field
- 🌐 URL Visited
- 📱 Device Type

### ⏱️ Delays
**Time-based Delays:**
- 15 Minutes to 1 Month
- Custom business logic delays

**Business Logic Delays:**
- After Purchase
- After Signup
- After Email Open
- After Email Click

## How to Use

### 1. Creating Nodes
1. **Drag** elements from the sidebar to the canvas
2. **Drop** them where you want them positioned
3. **Click** on nodes to configure them

### 2. Connecting Nodes
1. **Click** the link button (🔗) on the source node
2. **Click** on the target node to create a connection
3. **Visual feedback** shows connection mode is active
4. **Cancel** connection mode by clicking the X button

### 3. Configuring Nodes
1. **Click** on any node to open configuration
2. **Select** the appropriate type (trigger, action, condition, delay)
3. **Customize** the node label and settings
4. **Save** your changes

### 4. Building Workflows

#### Example 1: Welcome Series
```
Start → Customer Signup → Delay (1 hour) → Send Welcome Email → Assign Tag "New Customer"
```

#### Example 2: Abandoned Cart Recovery
```
Start → Cart Abandoned → Delay (2 hours) → Send Abandoned Cart Email → Delay (1 day) → Send Follow-up SMS
```

#### Example 3: Customer Nurturing
```
Start → Customer Signup → Assign Tag "Lead" → Delay (1 week) → Send Follow-up Email → Condition (Email Opened) → Assign Tag "Engaged"
```

## Best Practices

### 1. Workflow Design
- **Start Simple**: Begin with basic workflows and add complexity
- **Test Thoroughly**: Use test data before going live
- **Monitor Performance**: Track workflow execution and success rates

### 2. Node Placement
- **Organize Logically**: Place nodes in a logical flow from left to right
- **Use Spacing**: Leave enough space between nodes for connections
- **Group Related Actions**: Keep related actions close together

### 3. Naming Conventions
- **Descriptive Names**: Use clear, descriptive names for workflows
- **Consistent Labeling**: Use consistent naming for similar node types
- **Version Control**: Include version numbers for complex workflows

## Troubleshooting

### Common Issues

**Nodes Not Connecting:**
- Ensure you're in connection mode (blue ring around source node)
- Click the link button (🔗) first, then click the target node
- Check that both nodes are properly positioned

**Workflow Not Saving:**
- Ensure you've entered a workflow name
- Check that all required fields are filled
- Verify your database connection

**Visual Issues:**
- Refresh the page if the canvas appears blank
- Check browser console for JavaScript errors
- Ensure all dependencies are properly loaded

## Advanced Features

### 1. Conditional Logic
Use condition nodes to create branching workflows:
- **If/Then Logic**: Different actions based on conditions
- **Multiple Paths**: Create complex decision trees
- **Fallback Actions**: Default actions when conditions aren't met

### 2. Time-based Automation
Leverage delay nodes for sophisticated timing:
- **Sequential Delays**: Build multi-step campaigns
- **Business Logic Delays**: Trigger actions after specific events
- **Recurring Workflows**: Automate ongoing customer engagement

### 3. Integration Capabilities
Connect with external systems:
- **Webhooks**: Send data to other applications
- **API Calls**: Integrate with third-party services
- **Zapier**: Connect to 1000+ apps and services

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all required data is properly configured
3. Test with simple workflows first
4. Contact support with specific error details

---

**Happy Workflow Building! 🚀**
