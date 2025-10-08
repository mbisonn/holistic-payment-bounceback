import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface MultiSendCampaignProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
}

export const MultiSendCampaign = ({ 
  open, 
  onOpenChange, 
  templates
}: MultiSendCampaignProps) => {
  const { toast } = useToast();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'tag'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sending, setSending] = useState(false);

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSend = async () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one template to send',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      // Get recipients based on filter
      let recipients: string[] = [];
      
      if (recipientFilter === 'all') {
        const { data: users } = await supabase.auth.admin.listUsers();
        recipients = users?.users.map(u => u.email).filter(Boolean) as string[] || [];
      } else {
        // Get users with specific tag
        const { data: taggedCustomers } = await supabase
          .from('customer_notes')
          .select('customer_email')
          .contains('tags', [selectedTag]);
        recipients = taggedCustomers?.map(c => c.customer_email) || [];
      }

      // Schedule emails for each template and recipient
      const schedulePromises = selectedTemplates.map(async (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const emailPromises = recipients.map(email => 
          supabase.from('scheduled_emails').insert({
            recipient_email: email,
            subject: template.subject,
            content: template.subject, // Body will be populated by automation
            template_id: templateId,
            scheduled_at: new Date().toISOString(),
            status: 'scheduled'
          })
        );

        return Promise.all(emailPromises);
      });

      await Promise.all(schedulePromises);

      toast({
        title: 'Success',
        description: `${selectedTemplates.length} email templates scheduled to ${recipients.length} recipients`
      });

      onOpenChange(false);
      setSelectedTemplates([]);
      setRecipientFilter('all');
      setSelectedTag('');
    } catch (error: any) {
      console.error('Error sending campaigns:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send campaigns',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Send Multiple Email Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label className="text-white mb-2 block">Select Templates to Send</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto glass-secondary p-3 rounded-lg border border-white/20">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={template.id}
                    checked={selectedTemplates.includes(template.id)}
                    onCheckedChange={() => handleTemplateToggle(template.id)}
                    className="border-white/30"
                  />
                  <label
                    htmlFor={template.id}
                    className="text-sm text-white cursor-pointer flex-1"
                  >
                    {template.name} - {template.subject}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Filter */}
          <div>
            <Label className="text-white mb-2 block">Recipients</Label>
            <Select value={recipientFilter} onValueChange={(v: 'all' | 'tag') => setRecipientFilter(v)}>
              <SelectTrigger className="glass-input text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="tag">Users with Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientFilter === 'tag' && (
            <div>
              <Label className="text-white mb-2 block">Tag</Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="glass-input text-white border-white/20">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
              className="glass-button-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || selectedTemplates.length === 0}
              className="glass-button"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Users
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
