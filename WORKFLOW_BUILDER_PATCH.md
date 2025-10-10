# Workflow Builder Enhancement - Simple Implementation Guide

## Step 1: Add State Variables

In `src/components/admin/workflow/VisualWorkflowBuilder.tsx`, find line 103 (after `const [uploading, setUploading] = useState(false);`)

**Add these two lines:**
```typescript
  const [emailCampaigns, setEmailCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [emailTemplates, setEmailTemplates] = useState<Array<{ id: string; name: string }>>([]);
```

## Step 2: Update Data Loading

Find the useEffect at line 193 that loads tags. **Replace the entire useEffect** (lines 193-204) with:

```typescript
  // Load customer tags, email campaigns, and templates for action configuration
  useEffect(() => {
    (async () => {
      try {
        // Load tags
        const { data: tagsData, error: tagsError } = await supabase.from('customer_tags').select('id, name');
        if (tagsError) throw tagsError;
        setAvailableTags((tagsData || []).map((t: any) => ({ id: t.id, name: t.name })));

        // Load email campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('email_campaigns')
          .select('id, name')
          .eq('is_active', true);
        if (!campaignsError) {
          setEmailCampaigns((campaignsData || []).map((c: any) => ({ id: c.id, name: c.name })));
        }

        // Load email templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('email_templates')
          .select('id, name');
        if (!templatesError) {
          setEmailTemplates((templatesData || []).map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch (e) {
        console.error('Failed to load workflow resources', e);
      }
    })();
  }, []);
```

## Step 3: Add Action Configuration UI

Find line 1130 (after `</Select>` and before `{selectedNode.data.actionType === 'send_meal_plan' && (`).

**Insert this code block:**

```typescript
                      {/* Send Email Campaign Action */}
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

                      {/* Assign Tag Action */}
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

                      {/* Remove Tag Action */}
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

## Testing

After making these changes:

1. Save the file
2. The TypeScript build should complete with 0 errors
3. Go to Automations → Workflow Builder
4. Create an "Action" node
5. Double-click to configure
6. Select "Send Email" - you should see dropdowns for campaigns and templates
7. Select "Assign Tag" or "Remove Tag" - you should see dropdown for tags

## What This Does

- **Send Email**: Users can now select from existing email campaigns or templates instead of manually typing
- **Assign Tag**: Users can select which tag to assign to customers
- **Remove Tag**: Users can select which tag to remove from customers

All data is loaded from the Supabase database automatically when the workflow builder opens!
