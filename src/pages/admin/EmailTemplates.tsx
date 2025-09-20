
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    // Add Google Review template if not present
    (async () => {
      const { data: existing, error } = await supabase
        .from('email_templates')
        .select('id')
        .eq('name', 'Google Review Request');
      if (!error && (!existing || existing.length === 0)) {
        await supabase.from('email_templates').insert({
          name: 'Google Review Request',
          subject: 'How did we do? Please rate your experience',
          body: `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Rate Our Service</title>\n</head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"color: #2c3e50;\">How did we do?</h1>\n    <p>Hello {{customer_name}},</p>\n    <p>Thank you for choosing us, we'd love your feedback. How was your experience today?</p>\n    <div style=\"display: flex; flex-wrap: wrap; justify-content: space-between; margin-top: 20px;\">\n        <a href=\"https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=1&email={{customer_email}}\" style=\"background-color: #FF4136; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;\">1 - Poor</a>\n        <a href=\"https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=2&email={{customer_email}}\" style=\"background-color: #FF851B; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;\">2 - Fair</a>\n        <a href=\"https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=3&email={{customer_email}}\" style=\"background-color: #FFDC00; color: black; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;\">3 - Good</a>\n        <a href=\"https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=4&email={{customer_email}}\" style=\"background-color: #2ECC40; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;\">4 - Great </a>\n        <a href=\"https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=5&email={{customer_email}}\" style=\"background-color: #0074D9; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;\">5 - Excellent</a>\n    </div>\n    <p>Your feedback helps us to be better.</p>\n    <p>I appreciate you,</p>\n    <p>Tenera holistic and Wellness Team</p>\n    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n        <tbody>\n            <tr>\n                <td>\n                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                        <tbody>\n                            <tr>\n                                <td style=\"vertical-align: top;\">\n                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                        <tbody>\n                                            <tr>\n                                                <td style=\"text-align: center;\">\n                                                    <img src=\"https://d1yei2z3i6k35z.cloudfront.net/8917555/67d291b5bb27a_Teneralogo2.png\" role=\"presentation\" width=\"130\" style=\"display: block; max-width: 128px;\">\n                                                </td>\n                                            </tr>\n                                            <tr>\n                                                <td height=\"30\"></td>\n                                            </tr>\n                                            <tr>\n                                                <td style=\"text-align: center;\">\n                                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"display: inline-block; vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                                        <tbody>\n                                                            <tr style=\"text-align: center;\">\n                                                                <td>\n                                                                    <a href=\"//qerger\" style=\"display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/facebook-icon-2x.png\" alt=\"facebook\" width=\"24\" style=\"background-color: rgb(112, 117, 219); max-width: 135px; display: block;\">\n                                                                    </a>\n                                                                </td>\n                                                                <td width=\"5\">\n                                                                    <div></div>\n                                                                </td>\n                                                                <td>\n                                                                    <a href=\"//erg\" style=\"display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/twitter-icon-2x.png\" alt=\"twitter\" width=\"24\" style=\"background-color: rgb(112, 117, 219); max-width: 135px; display: block;\">\n                                                                    </a>\n                                                                </td>\n                                                                <td width=\"5\">\n                                                                    <div></div>\n                                                                </td>\n                                                                <td>\n                                                                    <a href=\"//asdfref\" style=\"display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/linkedin-icon-2x.png\" alt=\"linkedin\" width=\"24\" style=\"background-color: rgb(112, 117, 219); max-width: 135px; display: block;\">\n                                                                    </a>\n                                                                </td>\n                                                                <td width=\"5\">\n                                                                    <div></div>\n                                                                </td>\n                                                                <td>\n                                                                    <a href=\"//eqrger\" style=\"display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/instagram-icon-2x.png\" alt=\"instagram\" width=\"24\" style=\"background-color: rgb(112, 117, 219); max-width: 135px; display: block;\">\n                                                                    </a>\n                                                                </td>\n                                                                <td width=\"5\">\n                                                                    <div></div>\n                                                                </td>\n                                                            </tr>\n                                                        </tbody>\n                                                    </table>\n                                                </td>\n                                            </tr>\n                                        </tbody>\n                                    </table>\n                                </td>\n                                <td width=\"46\">\n                                    <div></div>\n                                </td>\n                                <td style=\"padding: 0px; vertical-align: middle;\">\n                                    <h2 style=\"margin: 0px; font-size: 18px; color: rgb(0, 0, 0); font-weight: 600;\">\n                                        <span>Dr. Amaka</span>\n                                        <span>&nbsp;</span>\n                                        <span></span>\n                                    </h2>\n                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width: 100%; vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                        <tbody>\n                                            <tr>\n                                                <td height=\"30\"></td>\n                                            </tr>\n                                            <tr>\n                                                <td style=\"width: 100%; border-bottom: 1px solid rgb(164, 12, 63); border-left: none; display: block;\"></td>\n                                            </tr>\n                                            <tr>\n                                                <td height=\"30\"></td>\n                                            </tr>\n                                        </tbody>\n                                    </table>\n                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                        <tbody>\n                                            <tr height=\"25\" style=\"vertical-align: middle;\">\n                                                <td width=\"30\" style=\"vertical-align: middle;\">\n                                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                                        <tbody>\n                                                            <tr>\n                                                                <td style=\"vertical-align: bottom;\">\n                                                                    <span style=\"display: inline-block; background-color: rgb(164, 12, 63);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/phone-icon-2x.png\" alt=\"mobilePhone\" width=\"13\" style=\"display: block; background-color: rgb(164, 12, 63);\">\n                                                                    </span>\n                                                                </td>\n                                                            </tr>\n                                                        </tbody>\n                                                    </table>\n                                                </td>\n                                                <td style=\"padding: 0px; color: rgb(0, 0, 0);\">\n                                                    <a href=\"tel:0777 777 7777 \" style=\"text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;\">\n                                                        <span>0777 777 7777 </span>\n                                                    </a>\n                                                </td>\n                                            </tr>\n                                            <tr height=\"25\" style=\"vertical-align: middle;\">\n                                                <td width=\"30\" style=\"vertical-align: middle;\">\n                                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                                        <tbody>\n                                                            <tr>\n                                                                <td style=\"vertical-align: bottom;\">\n                                                                    <span style=\"display: inline-block; background-color: rgb(164, 12, 63);\">\n                                                                        <img src=\"https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/link-icon-2x.png\" alt=\"website\" width=\"13\" style=\"display: block; background-color: rgb(164, 12, 63);\">\n                                                                    </span>\n                                                                </td>\n                                                            </tr>\n                                                        </tbody>\n                                                    </table>\n                                                </td>\n                                                <td style=\"padding: 0px;\">\n                                                    <a href=\"//barberbarberrr.co\" style=\"text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;\">\n                                                        <span>barberbarberrr.co</span>\n                                                    </a>\n                                                </td>\n                                            </tr>\n                                        </tbody>\n                                    </table>\n                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;\">\n                                        <tbody>\n                                            <tr>\n                                                <td height=\"30\"></td>\n                                            </tr>\n                                        </tbody>\n                                    </table>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</body>\n</html>`,
          is_active: true
        });
      }
    })();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const res = await withTimeout(
        supabase
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      // Transform data to match our interface, handling nullable is_active
      const transformedData = (data || []).map((template: any) => ({
        ...template,
        is_active: template.is_active ?? false
      }));
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
      toast({ title: 'Error', description: 'Failed to fetch templates', variant: 'destructive' });
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(formData)
          .eq('id', selectedTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([formData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Template ${selectedTemplate ? 'updated' : 'created'} successfully`,
      });

      setShowTemplateDialog(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      is_active: true
    });
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      is_active: template.is_active
    });
    setShowTemplateDialog(true);
  };

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        subject: template.subject,
        body: template.body,
        is_active: false
      };

      const { error } = await supabase
        .from('email_templates')
        .insert([duplicateData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage your email templates</p>
        </div>
        <Button onClick={() => setShowTemplateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPreviewDialog(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate ? 'Update template details' : 'Create a new email template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Email Content</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter email content (HTML supported)"
                rows={15}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {selectedTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject:</Label>
              <p className="text-sm bg-muted p-2 rounded">{selectedTemplate?.subject}</p>
            </div>
            <div>
              <Label>Content Preview:</Label>
              <div 
                className="border rounded p-4 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedTemplate?.body || '' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;
