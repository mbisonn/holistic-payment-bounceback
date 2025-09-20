import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Code, Save, Type } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

interface EmailTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSaved: () => void;
}

export const EmailTemplateEditor = ({ open, onOpenChange, template, onSaved }: EmailTemplateEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    is_active: true
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        is_active: template.is_active
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        body: '',
        is_active: true
      });
    }
  }, [template]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (template) {
        const { error } = await supabase
          .from('email_templates')
          .update(formData)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([formData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Template ${template ? 'updated' : 'created'} successfully`,
      });

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('emailBody') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData(prev => ({ ...prev, body: newText }));
    }
  };

  const placeholders = [
    { label: 'Customer Name', value: '{{customer_name}}' },
    { label: 'Customer Email', value: '{{customer_email}}' },
    { label: 'Order Total', value: '{{order_total}}' },
    { label: 'Order Items', value: '{{order_items}}' },
    { label: 'Company Name', value: '{{company_name}}' },
    { label: 'Current Date', value: '{{current_date}}' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card glass-modal max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-glass-text flex items-center space-x-2">
            <Type className="w-5 h-5" />
            <span>{template ? 'Edit Email Template' : 'Create Email Template'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-glass-text">Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                className="glass-input text-glass-text"
              />
            </div>
            <div>
              <Label className="text-glass-text">Subject Line</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
                className="glass-input text-glass-text"
              />
            </div>
          </div>

          {/* Placeholders */}
          <div>
            <Label className="text-glass-text mb-2 block">Insert Placeholders</Label>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Button
                  key={placeholder.value}
                  size="sm"
                  variant="outline"
                  onClick={() => insertPlaceholder(placeholder.value)}
                  className="glass-button-outline text-xs"
                >
                  {placeholder.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Editor/Preview Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={!previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(false)}
              className="glass-button-outline"
            >
              <Code className="w-4 h-4 mr-1" />
              Editor
            </Button>
            <Button
              size="sm"
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(true)}
              className="glass-button-outline"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>

          {/* Email Body Editor/Preview */}
          <div className="space-y-2">
            <Label className="text-glass-text">Email Content</Label>
            {!previewMode ? (
              <Textarea
                id="emailBody"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter your email content here. Use HTML for formatting."
                className="glass-input text-glass-text min-h-[300px] font-mono"
              />
            ) : (
              <div 
                className="glass-card p-4 min-h-[300px] border border-glass-border overflow-auto"
                dangerouslySetInnerHTML={{ 
                  __html: formData.body
                    .replace(/{{customer_name}}/g, 'John Doe')
                    .replace(/{{customer_email}}/g, 'john.doe@example.com')
                    .replace(/{{order_total}}/g, '₦75,000')
                    .replace(/{{order_items}}/g, 'BounceBack Life Essentials, Wellness Package')
                    .replace(/{{company_name}}/g, 'BounceBack Life Consult')
                    .replace(/{{current_date}}/g, new Date().toLocaleDateString())
                }}
              />
            )}
          </div>

          {/* Template Examples */}
          <div className="border-t border-glass-border pt-4">
            <Label className="text-glass-text mb-2 block">Quick Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  body: `<h2>Welcome to BounceBack Life Consult!</h2>
<p>Dear {{customer_name}},</p>
<p>Thank you for your recent purchase. We're excited to have you as part of our wellness community!</p>
<p>Your order details:</p>
<ul>{{order_items}}</ul>
<p>Total: {{order_total}}</p>
<p>Best regards,<br>{{company_name}} Team</p>`
                }))}
                className="glass-button-outline text-xs p-2 h-auto"
              >
                Welcome Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  body: `<h2>Your Order Has Been Shipped!</h2>
<p>Hi {{customer_name}},</p>
<p>Great news! Your order has been shipped and is on its way to you.</p>
<p>Order Total: {{order_total}}</p>
<p>Estimated delivery: 3-5 business days</p>
<p>Thank you for choosing {{company_name}}!</p>`
                }))}
                className="glass-button-outline text-xs p-2 h-auto"
              >
                Shipping Update
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  body: `<h2>How was your experience?</h2>
<p>Hello {{customer_name}},</p>
<p>We hope you're enjoying your recent purchase from {{company_name}}!</p>
<p>Would you mind taking a moment to share your experience with a review? Your feedback helps us serve you better.</p>
<p><a href="#" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leave a Review</a></p>
<p>Thank you!</p>`
                }))}
                className="glass-button-outline text-xs p-2 h-auto"
              >
                Review Request
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="glass-button-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !formData.name || !formData.subject || !formData.body}
              className="glass-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};