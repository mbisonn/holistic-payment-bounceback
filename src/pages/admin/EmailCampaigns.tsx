import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';
import { EmailTemplateEditor } from '@/components/admin/email/EmailTemplateEditor';
import { MultiSendCampaign } from '@/components/admin/email/MultiSendCampaign';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id: string | null;
  status: string | null;
  recipient_tags: string[] | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    template_id: '',
    status: 'draft'
  });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showMultiSend, setShowMultiSend] = useState(false);
  const { toast } = useToast();

  const createGoogleReviewAutomation = useCallback(async (templateId: string) => {
    try {
      // Create automation workflow for Google Review - 1 Month After Purchase
      const automationData = {
        name: 'Google Review Request - 1 Month After Purchase',
        trigger: 'purchase_paystack',
        action: 'send_email_campaign',
        trigger_data: JSON.stringify({ delay_hours: 720 }), // 30 days
        action_data: JSON.stringify({ 
          template_id: templateId,
          campaign_name: 'Google Review Request'
        }),
        is_active: true
      };
      
      const { error } = await supabase.from('automation_rules').upsert(automationData);
      if (!error) {
        console.log('Google Review automation created successfully');
      }
    } catch (e) {
      console.error('Failed to create Google Review automation:', e);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    // Add Google Review campaign if not present
    (async () => {
      // Ensure Google Review template exists with proper executable HTML body
      const templateName = 'Google Review Request';
      const templateSubject = 'How did we do? Rate your experience';
      const reviewHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rate Our Service</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9; 
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        h1 { 
            color: #2c3e50; 
            text-align: center; 
            margin-bottom: 20px; 
        }
        .rating-buttons { 
            display: flex; 
            flex-wrap: wrap; 
            justify-content: space-between; 
            margin: 20px 0; 
        }
        .rating-btn { 
            background-color: #0074D9; 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            margin: 5px; 
            font-size: 14px; 
            text-decoration: none; 
            border-radius: 5px; 
            text-align: center; 
            display: inline-block; 
            transition: all 0.3s ease; 
            flex: 1; 
            min-width: 80px;
        }
        .rating-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
        }
        .rating-btn.one { background-color: #FF4136; }
        .rating-btn.two { background-color: #FF851B; }
        .rating-btn.three { background-color: #FFDC00; color: #333; }
        .rating-btn.four { background-color: #2ECC40; }
        .rating-btn.five { background-color: #0074D9; }
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
        }
        @media (max-width: 480px) {
            .rating-buttons { flex-direction: column; }
            .rating-btn { margin: 5px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>How did we do?</h1>
        <p>Hello {{name}},</p>
        <p>Thank you for choosing us! We'd love your feedback on your recent experience. Your honest review helps us improve and helps other customers make informed decisions.</p>
        
        <div class="rating-buttons">
            <a href="https://www.bouncebacktolifeconsult.pro/contact" class="rating-btn one">1 - Poor</a>
            <a href="https://www.bouncebacktolifeconsult.pro/contact" class="rating-btn two">2 - Fair</a>
            <a href="https://www.bouncebacktolifeconsult.pro/contact" class="rating-btn three">3 - Good</a>
            <a href="https://www.bouncebacktolifeconsult.pro/contact" class="rating-btn four">4 - Great</a>
            <a href="https://share.google/oP16mxq5cSrdVuEBm" class="rating-btn five">5 - Excellent</a>
        </div>
        
        <p><strong>Your feedback is invaluable to us!</strong></p>
        <p>If you had a great experience (4-5 stars), please share it on Google Reviews to help others discover our services.</p>
        <p>If there's anything we can improve (1-3 stars), please let us know directly so we can address your concerns.</p>
        
        <div class="footer">
            <p>Thank you for your time!</p>
            <p><strong>Tenera Holistic and Wellness Team</strong></p>
        </div>
    </div>
</body>
</html>`;
      
      const { data: found } = await supabase.from('email_templates').select('id').eq('name', templateName);
      let templateId = found && found.length > 0 ? found[0].id : null;
      
      if (!templateId) {
        const { data: inserted, error: insertErr } = await supabase.from('email_templates').insert({ 
          name: templateName, 
          subject: templateSubject, 
          body: reviewHtml, 
          is_active: true 
        }).select('id').single();
        if (!insertErr) templateId = inserted?.id;
      } else {
        // Ensure body is correct
        await supabase.from('email_templates').update({ 
          subject: templateSubject, 
          body: reviewHtml, 
          is_active: true 
        }).eq('id', templateId);
      }
      
      if (!templateId) return;
      
      // Create Google Review campaign if it doesn't exist
      const { data: existing, error } = await supabase
        .from('email_campaigns')
        .select('id')
        .eq('name', 'Google Review Request');
        
      if (!error && (!existing || existing.length === 0)) {
        await supabase.from('email_campaigns').insert({
          name: 'Google Review Request',
          subject: templateSubject,
          template_id: templateId,
          status: 'active'
        });
      }
      
      // Create automation workflow for Google Review
      await createGoogleReviewAutomation(templateId);
    })();
  }, [createGoogleReviewAutomation]);

  const fetchCampaigns = async () => {
    // Guard to force-resolve loading in case the request stalls
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const res = await withTimeout(
        supabase
          .from('email_campaigns')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email campaigns",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await withTimeout(
        supabase
          .from('email_templates')
          .select('id, name, subject, body, is_active')
          .eq('is_active', true) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      setTemplates((data || []).map((t: any) => ({ ...t, is_active: t.is_active ?? true })));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    }
  };

  const handleSaveCampaign = async () => {
    try {
      const campaignData = {
        ...formData,
        template_id: formData.template_id || null
      };

      if (selectedCampaign) {
        const { error } = await supabase
          .from('email_campaigns')
          .update(campaignData)
          .eq('id', selectedCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_campaigns')
          .insert([campaignData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Campaign ${selectedCampaign ? 'updated' : 'created'} successfully`,
      });

      setShowCampaignDialog(false);
      setSelectedCampaign(null);
      setFormData({
        name: '',
        subject: '',
        template_id: '',
        status: 'draft'
      });
      fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });

      fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      template_id: campaign.template_id || '',
      status: campaign.status || 'draft'
    });
    setShowCampaignDialog(true);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Manage your email campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateEditor(true);
            }}
            className="glass-button-outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowMultiSend(true)}
            className="glass-button-outline"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Multiple
          </Button>
          <Button onClick={() => setShowCampaignDialog(true)} className="glass-button">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{campaign.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={campaign.status === 'sent' ? "default" : "secondary"}>
                    {campaign.status || 'Draft'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="glass-card glass-modal max-w-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedCampaign ? 'Update campaign details' : 'Create a new email campaign'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter campaign name"
                className="glass-input text-white border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-white">Subject Line</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
                className="glass-input text-white border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="template" className="text-white">Email Template</Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger className="glass-input border-white/20 text-white">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{template.name} - {template.subject}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTemplate(template);
                              setShowTemplateEditor(true);
                            }}
                            className="ml-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCampaignDialog(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button onClick={handleSaveCampaign} className="glass-button">
                {selectedCampaign ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Template Editor */}
      <EmailTemplateEditor
        open={showTemplateEditor}
        onOpenChange={setShowTemplateEditor}
        template={editingTemplate}
        onSaved={() => {
          fetchTemplates();
          setEditingTemplate(null);
        }}
      />

      {/* Multi Send Campaign */}
      <MultiSendCampaign
        open={showMultiSend}
        onOpenChange={setShowMultiSend}
        templates={templates}
      />
    </div>
  );
};

export default EmailCampaigns;
