import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  template_body: string;
  variables: any;
  category: string;
  is_active: boolean | null;
}

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_body: '',
    variables: '',
    category: 'marketing'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data as Template[]);
    }
  };

  const saveTemplate = async () => {
    try {
      const variables = formData.variables.split(',').map(v => v.trim()).filter(Boolean);
      
      if (editingTemplate) {
        const { error } = await supabase
          .from('whatsapp_templates')
          .update({
            name: formData.name,
            template_body: formData.template_body,
            variables,
            category: formData.category
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('whatsapp_templates')
          .insert({
            name: formData.name,
            template_body: formData.template_body,
            variables,
            category: formData.category
          });

        if (error) throw error;
        toast.success('Template created successfully');
      }

      setShowDialog(false);
      setFormData({ name: '', template_body: '', variables: '', category: 'marketing' });
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Template deleted');
      fetchTemplates();
    }
  };

  const editTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_body: template.template_body,
      variables: Array.isArray(template.variables) ? template.variables.join(', ') : '',
      category: template.category
    });
    setShowDialog(true);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-glass-text">
            <FileText className="h-5 w-5" />
            WhatsApp Templates
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-glass-text">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-glass-text">Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-glass-text">Content</Label>
                  <Textarea
                    value={formData.template_body}
                    onChange={(e) => setFormData(prev => ({ ...prev, template_body: e.target.value }))}
                    placeholder="Use {{1}}, {{2}} for variables"
                    className="glass-input min-h-[100px]"
                  />
                </div>
                <div>
                  <Label className="text-glass-text">Variables (comma-separated)</Label>
                  <Input
                    value={formData.variables}
                    onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                    placeholder="name, amount, date"
                    className="glass-input"
                  />
                </div>
                <Button onClick={saveTemplate} className="w-full glass-button">
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-glass-border">
              <TableHead className="text-glass-text">Name</TableHead>
              <TableHead className="text-glass-text">Content</TableHead>
              <TableHead className="text-glass-text">Variables</TableHead>
              <TableHead className="text-glass-text">Status</TableHead>
              <TableHead className="text-glass-text">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="border-glass-border">
                <TableCell className="text-glass-text">{template.name}</TableCell>
                <TableCell className="text-glass-text max-w-[300px] truncate">
                  {template.template_body}
                </TableCell>
                <TableCell>
                  {Array.isArray(template.variables) && template.variables.map((v: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="mr-1 text-xs">
                      {v}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editTemplate(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
