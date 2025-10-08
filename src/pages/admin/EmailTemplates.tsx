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

// Placeholder for Google review template
const GOOGLE_REVIEW_TEMPLATE = [
  {
    id: 'google-review-template',
    name: 'Google Review Response',
    subject: 'Thank you for your review!',
    body: 'Thank you for taking the time to leave us a review. We appreciate your feedback!',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
    // Add or update Google Review template
    (async () => {
      const { data: existing, error } = await supabase
        .from('email_templates')
        .select('id')
        .eq('name', 'Google Review Request');
      
      if (!error) {
        if (!existing || existing.length === 0) {
          // Insert new template
          await supabase.from('email_templates').insert(GOOGLE_REVIEW_TEMPLATE);
        } else {
          // Update existing template with new content
          await supabase
            .from('email_templates')
            .update({
              subject: GOOGLE_REVIEW_TEMPLATE[0].subject,
              body: GOOGLE_REVIEW_TEMPLATE[0].body,
              is_active: GOOGLE_REVIEW_TEMPLATE[0].is_active
            })
            .eq('name', 'Google Review Request');
        }
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
