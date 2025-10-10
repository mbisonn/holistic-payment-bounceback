# Implementation Roadmap - Automation & Integration Features

## ✅ Completed Tasks

### 1. Fixed Upsell Payment Link Generation
**Status**: ✅ COMPLETED & DEPLOYED

**What was fixed**:
- Improved error handling in `supabase/functions/payment-links/index.ts`
- Better error messages when products aren't found
- Function deployed successfully to production

**Testing**: Try generating a payment link for an upsell product in the dashboard.

---

### 2. Workflow Builder Visual Connections
**Status**: ✅ ALREADY WORKING

**Current Implementation**:
The Visual Workflow Builder (`src/components/admin/workflow/VisualWorkflowBuilder.tsx`) already has:
- ✅ Visual node connections using ReactFlow
- ✅ Drag handles on nodes to create connections
- ✅ Connection validation (prevents invalid connections)
- ✅ Conditional branching with Yes/No paths
- ✅ Auto-layout with Dagre algorithm
- ✅ Animated connection lines

**How to use**:
1. Navigate to Automations → Workflow Builder
2. Drag elements from the sidebar to the canvas
3. Click and drag from the circular handles on nodes to connect them
4. Double-click nodes to configure them

---

## 🚧 Pending Implementation

### 3. Connect Dashboard Features to Workflow Builder

**Goal**: Allow users to select actual email campaigns, tags, and templates created in the dashboard when configuring workflow actions.

#### Implementation Steps:

**Step 1: Add State for Dashboard Resources** ✅ READY TO IMPLEMENT
```typescript
// In VisualWorkflowBuilder.tsx, add these state variables (around line 102):
const [emailCampaigns, setEmailCampaigns] = useState<Array<{ id: string; name: string }>>([]);
const [emailTemplates, setEmailTemplates] = useState<Array<{ id: string; name: string }>>([]);
```

**Step 2: Load Resources from Database** ✅ READY TO IMPLEMENT
```typescript
// Update the useEffect that loads tags (around line 193) to also load campaigns and templates:
useEffect(() => {
  (async () => {
    try {
      // Load tags
      const { data: tagsData } = await supabase.from('customer_tags').select('id, name');
      setAvailableTags((tagsData || []).map((t: any) => ({ id: t.id, name: t.name })));

      // Load email campaigns
      const { data: campaignsData } = await supabase
        .from('email_campaigns')
        .select('id, name')
        .eq('is_active', true);
      setEmailCampaigns((campaignsData || []).map((c: any) => ({ id: c.id, name: c.name })));

      // Load email templates
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('id, name');
      setEmailTemplates((templatesData || []).map((t: any) => ({ id: t.id, name: t.name })));
    } catch (e) {
      console.error('Failed to load workflow resources', e);
    }
  })();
}, []);
```

**Step 3: Add Configuration UI for Each Action Type**

Find the section where `selectedNode.data.nodeType === 'action'` (around line 1114) and add these configurations:

**For "Send Email" Action**:
```typescript
{selectedNode.data.actionType === 'send_email' && (
  <div className="mt-4 space-y-3">
    <div>
      <Label className="text-glass-text">Email Campaign</Label>
      <Select
        value={String(selectedNode.data.emailCampaignId || '')}
        onValueChange={(value) => updateNodeData(selectedNode.id, { emailCampaignId: value })}
      >
        <SelectTrigger className="glass-input">
          <SelectValue placeholder="Select email campaign" />
        </SelectTrigger>
        <SelectContent className="glass-card max-h-64 overflow-auto">
          {emailCampaigns.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400 mt-1">Or use a template below</p>
    </div>
    
    <div>
      <Label className="text-glass-text">Email Template (alternative)</Label>
      <Select
        value={String(selectedNode.data.emailTemplateId || '')}
        onValueChange={(value) => updateNodeData(selectedNode.id, { emailTemplateId: value })}
      >
        <SelectTrigger className="glass-input">
          <SelectValue placeholder="Select email template" />
        </SelectTrigger>
        <SelectContent className="glass-card max-h-64 overflow-auto">
          {emailTemplates.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
```

**For "Assign Tag" Action**:
```typescript
{selectedNode.data.actionType === 'assign_tag' && (
  <div className="mt-4 space-y-3">
    <div>
      <Label className="text-glass-text">Customer Tag</Label>
      <Select
        value={String(selectedNode.data.tagId || '')}
        onValueChange={(value) => updateNodeData(selectedNode.id, { tagId: value })}
      >
        <SelectTrigger className="glass-input">
          <SelectValue placeholder="Select tag to assign" />
        </SelectTrigger>
        <SelectContent className="glass-card max-h-64 overflow-auto">
          {availableTags.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
```

**For "Remove Tag" Action**:
```typescript
{selectedNode.data.actionType === 'remove_tag' && (
  <div className="mt-4 space-y-3">
    <div>
      <Label className="text-glass-text">Customer Tag</Label>
      <Select
        value={String(selectedNode.data.tagId || '')}
        onValueChange={(value) => updateNodeData(selectedNode.id, { tagId: value })}
      >
        <SelectTrigger className="glass-input">
          <SelectValue placeholder="Select tag to remove" />
        </SelectTrigger>
        <SelectContent className="glass-card max-h-64 overflow-auto">
          {availableTags.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
```

**Step 4: Update Workflow Execution Backend**

When workflows are executed, update the backend handler to:
1. Read the saved `emailCampaignId`, `emailTemplateId`, or `tagId` from the node data
2. Fetch the actual campaign/template/tag from the database
3. Execute the action with the fetched data

---

### 4. WhatsApp Integration Implementation

**Goal**: Build complete WhatsApp integration with all features for customer communication.

#### Database Schema

**Create `whatsapp_settings` table**:
```sql
CREATE TABLE public.whatsapp_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_provider TEXT NOT NULL CHECK (api_provider IN ('twilio', 'whatsapp_business_api', 'vonage')),
  api_key TEXT NOT NULL,
  api_secret TEXT,
  phone_number TEXT NOT NULL,
  phone_number_id TEXT,
  business_account_id TEXT,
  webhook_url TEXT,
  webhook_verify_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Create `whatsapp_messages` table**:
```sql
CREATE TABLE public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  message_sid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  message_body TEXT NOT NULL,
  media_url TEXT,
  media_content_type TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_customer_phone ON public.whatsapp_messages(customer_phone);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
CREATE INDEX idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
```

**Create `whatsapp_templates` table**:
```sql
CREATE TABLE public.whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  category TEXT NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  template_body TEXT NOT NULL,
  header_text TEXT,
  footer_text TEXT,
  buttons JSON,
  variables JSON,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  template_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Create `whatsapp_campaigns` table**:
```sql
CREATE TABLE public.whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.whatsapp_templates(id),
  target_tags TEXT[],
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Frontend Components

**1. WhatsApp Settings Component** (`src/components/admin/whatsapp/WhatsAppSettings.tsx`):
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, TestTube } from 'lucide-react';

export const WhatsAppSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    api_provider: 'twilio',
    api_key: '',
    api_secret: '',
    phone_number: '',
    phone_number_id: '',
    business_account_id: '',
    webhook_verify_token: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      if (data) setSettings(data);
    } catch (e) {
      console.error('Failed to load WhatsApp settings:', e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert(settings);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'WhatsApp settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    // Implement test message sending
    toast({
      title: 'Test',
      description: 'Sending test message...',
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">WhatsApp Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>API Provider</Label>
          <Select
            value={settings.api_provider}
            onValueChange={(value) => setSettings({ ...settings, api_provider: value })}
          >
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="whatsapp_business_api">WhatsApp Business API</SelectItem>
              <SelectItem value="vonage">Vonage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={settings.api_key}
            onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
            className="glass-input"
          />
        </div>

        <div>
          <Label>API Secret (if required)</Label>
          <Input
            type="password"
            value={settings.api_secret}
            onChange={(e) => setSettings({ ...settings, api_secret: e.target.value })}
            className="glass-input"
          />
        </div>

        <div>
          <Label>Phone Number (with country code)</Label>
          <Input
            placeholder="+234XXXXXXXXXX"
            value={settings.phone_number}
            onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
            className="glass-input"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading} className="glass-button">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={testConnection} variant="outline" className="glass-button-outline">
            <TestTube className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

**2. WhatsApp Templates Component** (`src/components/admin/whatsapp/WhatsAppTemplates.tsx`):
- Template creation form
- Template approval status
- Variable placeholders ({{name}}, {{order_id}}, etc.)
- Preview functionality

**3. WhatsApp Campaigns Component** (`src/components/admin/whatsapp/WhatsAppCampaigns.tsx`):
- Campaign creation
- Template selection
- Target audience selection (by tags)
- Scheduling
- Campaign analytics

**4. WhatsApp Chat Component** (`src/components/admin/whatsapp/WhatsAppChat.tsx`):
- Real-time chat interface
- Customer conversation history
- Quick replies
- Media attachments

#### Backend Edge Functions

**Create `supabase/functions/whatsapp-send/index.ts`**:
```typescript
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { to, message, templateId, variables } = await req.json();

    // Get WhatsApp settings
    const { data: settings } = await supabaseClient
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!settings) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send via Twilio (example)
    if (settings.api_provider === 'twilio') {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.api_key}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('From', `whatsapp:${settings.phone_number}`);
      formData.append('To', `whatsapp:${to}`);
      formData.append('Body', message);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${settings.api_key}:${settings.api_secret}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.json();

      // Log message in database
      await supabaseClient.from('whatsapp_messages').insert({
        customer_phone: to,
        direction: 'outbound',
        status: result.status || 'queued',
        message_body: message,
        message_sid: result.sid,
      });

      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported API provider' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Create `supabase/functions/whatsapp-webhook/index.ts`**:
```typescript
// Handles incoming WhatsApp messages and status updates
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();

    // Handle incoming message
    if (body.MessageSid && body.Body) {
      await supabaseClient.from('whatsapp_messages').insert({
        customer_phone: body.From.replace('whatsapp:', ''),
        direction: 'inbound',
        status: 'received',
        message_body: body.Body,
        message_sid: body.MessageSid,
      });
    }

    // Handle status updates
    if (body.MessageStatus) {
      await supabaseClient
        .from('whatsapp_messages')
        .update({ status: body.MessageStatus })
        .eq('message_sid', body.MessageSid);
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});
```

#### Integration with Workflow Builder

Add WhatsApp action to `actionTypes` in `VisualWorkflowBuilder.tsx`:
```typescript
{ value: 'send_whatsapp', label: '💬 Send WhatsApp', icon: '💬', color: 'green' },
```

Add configuration UI:
```typescript
{selectedNode.data.actionType === 'send_whatsapp' && (
  <div className="mt-4 space-y-3">
    <div>
      <Label className="text-glass-text">WhatsApp Template</Label>
      <Select
        value={String(selectedNode.data.whatsappTemplateId || '')}
        onValueChange={(value) => updateNodeData(selectedNode.id, { whatsappTemplateId: value })}
      >
        <SelectTrigger className="glass-input">
          <SelectValue placeholder="Select template" />
        </SelectTrigger>
        <SelectContent className="glass-card">
          {whatsappTemplates.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
```

---

## Deployment Checklist

### For Workflow Builder Enhancements:
- [ ] Add state variables for email campaigns and templates
- [ ] Update useEffect to load campaigns and templates
- [ ] Add configuration UI for send_email action
- [ ] Add configuration UI for assign_tag action
- [ ] Add configuration UI for remove_tag action
- [ ] Test creating a workflow with each action type
- [ ] Update workflow execution backend to use selected resources

### For WhatsApp Integration:
- [ ] Run all SQL migration scripts in Supabase dashboard
- [ ] Create WhatsApp settings component
- [ ] Create WhatsApp templates component
- [ ] Create WhatsApp campaigns component
- [ ] Create WhatsApp chat component
- [ ] Deploy whatsapp-send edge function
- [ ] Deploy whatsapp-webhook edge function
- [ ] Add WhatsApp option to navigation sidebar
- [ ] Set up Twilio/WhatsApp Business API account
- [ ] Configure webhook URL in Twilio/WhatsApp dashboard
- [ ] Test sending messages
- [ ] Test receiving messages
- [ ] Test template approval flow
- [ ] Test campaign scheduling
- [ ] Add WhatsApp action to workflow builder

---

## Testing Guide

### Test Upsell Payment Link:
1. Go to Upsell/Downsell section
2. Create or select a product
3. Click "Generate Link"
4. Verify payment link is created successfully
5. Test the link opens Paystack payment page

### Test Workflow Builder:
1. Go to Automations → Workflow Builder
2. Drag "Trigger" to canvas
3. Drag "Action" to canvas
4. Connect them by dragging from trigger's right handle to action's left handle
5. Verify connection line appears
6. Double-click action to configure
7. Save workflow

### Test WhatsApp (After Implementation):
1. Configure WhatsApp settings
2. Test connection
3. Create a template
4. Send test message
5. Verify message received on phone
6. Reply to message
7. Verify reply appears in dashboard

---

## Support Resources

- **Twilio WhatsApp API**: https://www.twilio.com/docs/whatsapp
- **WhatsApp Business Platform**: https://developers.facebook.com/docs/whatsapp
- **ReactFlow Documentation**: https://reactflow.dev/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

## Next Steps

1. **Immediate**: Test the upsell payment link fix in production
2. **Short-term**: Implement workflow builder dashboard connections (2-3 hours)
3. **Medium-term**: Complete WhatsApp integration (1-2 days)
4. **Long-term**: Add analytics dashboard for automation performance
