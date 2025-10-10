import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Send, Calendar } from 'lucide-react';

export default function WhatsAppCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    target_tags: [] as string[],
    scheduled_at: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [campaignsRes, templatesRes] = await Promise.all([
      supabase.from('whatsapp_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('whatsapp_templates').select('*').eq('is_active', true)
    ]);

    if (campaignsRes.data) setCampaigns(campaignsRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
  };

  const createCampaign = async () => {
    try {
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .insert({
          ...formData,
          status: formData.scheduled_at ? 'scheduled' : 'draft'
        });

      if (error) throw error;
      toast.success('Campaign created successfully');
      setShowDialog(false);
      setFormData({ name: '', description: '', template_id: '', target_tags: [], scheduled_at: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign');
    }
  };

  const sendCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    console.log('Sending campaign:', id);
    toast.info('Campaign sending started...');
    // Campaign sending would be handled by an edge function
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-glass-text">
            <Calendar className="h-5 w-5" />
            WhatsApp Campaigns
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-glass-text">Create Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-glass-text">Campaign Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-glass-text">Template</Label>
                  <Select
                    value={formData.template_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-glass-text">Schedule (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="glass-input"
                  />
                </div>
                <Button onClick={createCampaign} className="w-full glass-button">
                  Create Campaign
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
              <TableHead className="text-glass-text">Status</TableHead>
              <TableHead className="text-glass-text">Recipients</TableHead>
              <TableHead className="text-glass-text">Sent</TableHead>
              <TableHead className="text-glass-text">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id} className="border-glass-border">
                <TableCell className="text-glass-text">{campaign.name}</TableCell>
                <TableCell>
                  <Badge>{campaign.status}</Badge>
                </TableCell>
                <TableCell className="text-glass-text">{campaign.total_recipients || 0}</TableCell>
                <TableCell className="text-glass-text">{campaign.sent_count || 0}</TableCell>
                <TableCell>
                  {campaign.status === 'draft' && (
                    <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
