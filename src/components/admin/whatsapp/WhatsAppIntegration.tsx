import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  Send, 
  Bell, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Eye,
  Search
} from 'lucide-react';

interface WhatsAppConfig {
  id: string;
  phone_number: string;
  api_token: string;
  webhook_url: string;
  is_active: boolean;
  business_name: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: 'purchase_notification' | 'order_update' | 'marketing' | 'support';
  is_active: boolean;
  variables: string[];
  created_at: string;
}

interface WhatsAppMessage {
  id: string;
  customer_phone: string;
  customer_name?: string | null;
  template_id: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
}

interface WhatsAppStats {
  total_messages: number;
  sent_today: number;
  delivery_rate: number;
  read_rate: number;
  active_templates: number;
  failed_messages: number;
}

const WhatsAppIntegration = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newConfig, setNewConfig] = useState({
    phone_number: '',
    api_token: '',
    webhook_url: '',
    business_name: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'purchase_notification' as const,
    variables: [] as string[]
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch WhatsApp configuration
      const { data: configData, error: configError } = await supabase
        .from<any>('whatsapp_config')
        .select('*')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }
      setConfig(configData);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from<any>('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from<any>('whatsapp_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Calculate stats
      calculateStats(messagesData || []);

    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch WhatsApp data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (messagesData: WhatsAppMessage[]) => {
    const totalMessages = messagesData.length;
    const sentToday = messagesData.filter(msg => 
      new Date(msg.sent_at).toDateString() === new Date().toDateString()
    ).length;
    
    const deliveredMessages = messagesData.filter(msg => 
      msg.status === 'delivered' || msg.status === 'read'
    ).length;
    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
    
    const readMessages = messagesData.filter(msg => msg.status === 'read').length;
    const readRate = deliveredMessages > 0 ? (readMessages / deliveredMessages) * 100 : 0;
    
    const activeTemplates = templates.filter(t => t.is_active).length;
    const failedMessages = messagesData.filter(msg => msg.status === 'failed').length;

    setStats({
      total_messages: totalMessages,
      sent_today: sentToday,
      delivery_rate: deliveryRate,
      read_rate: readRate,
      active_templates: activeTemplates,
      failed_messages: failedMessages
    });
  };

  const saveConfig = async () => {
    try {
      if (!newConfig.phone_number || !newConfig.api_token || !newConfig.business_name) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const configData = {
        ...newConfig,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (config) {
        const { error } = await supabase
          .from<any>('whatsapp_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from<any>('whatsapp_config')
          .insert([configData]);

        if (error) throw error;
      }

      setConfig({ ...configData, id: config?.id || 'new', created_at: config?.created_at || new Date().toISOString() });
      setShowConfigDialog(false);
      setNewConfig({ phone_number: '', api_token: '', webhook_url: '', business_name: '' });

      toast({
        title: 'Success',
        description: 'WhatsApp configuration saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save WhatsApp configuration',
        variant: 'destructive'
      });
    }
  };

  const saveTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.content) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const templateData = {
        ...newTemplate,
        is_active: true,
        created_at: new Date().toISOString()
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from<any>('whatsapp_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from<any>('whatsapp_templates')
          .insert([templateData]);

        if (error) throw error;
      }

      fetchData();
      setShowTemplateDialog(false);
      setSelectedTemplate(null);
      setNewTemplate({ name: '', content: '', category: 'purchase_notification', variables: [] });

      toast({
        title: 'Success',
        description: 'Template saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    }
  };

  const toggleTemplateStatus = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from<any>('whatsapp_templates')
        .update({ is_active: isActive })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(template =>
        template.id === templateId ? { ...template, is_active: isActive } : template
      ));

      toast({
        title: 'Success',
        description: `Template ${isActive ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template status',
        variant: 'destructive'
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from<any>('whatsapp_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== templateId));

      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'purchase_notification': return 'bg-green-100 text-green-800';
      case 'order_update': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">WhatsApp Integration</h2>
          <p className="text-gray-300">Manage WhatsApp notifications and automation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowConfigDialog(true)}
            variant="outline"
            className="bounce-back-consult-button-outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
          <Button
            onClick={() => setShowTemplateDialog(true)}
            className="bounce-back-consult-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bounce-back-consult-card border-white/20 bg-transparent">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-white data-[state=active]:bg-white/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-white data-[state=active]:bg-white/20">
            <Send className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-white data-[state=active]:bg-white/20">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Configuration Status */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Configuration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{config.business_name}</p>
                    <p className="text-gray-300 text-sm">{config.phone_number}</p>
                    <Badge className={config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => {
                      setNewConfig({
                        phone_number: config.phone_number,
                        api_token: config.api_token,
                        webhook_url: config.webhook_url,
                        business_name: config.business_name
                      });
                      setShowConfigDialog(true);
                    }}
                    variant="outline"
                    className="bounce-back-consult-button-outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Configuration</h3>
                  <p className="text-gray-400 mb-4">Set up your WhatsApp Business API to start sending messages</p>
                  <Button
                    onClick={() => setShowConfigDialog(true)}
                    className="bounce-back-consult-button"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Messages</p>
                      <p className="text-2xl font-bold text-white">{stats.total_messages}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <Send className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Sent Today</p>
                      <p className="text-2xl font-bold text-white">{stats.sent_today}</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/20">
                      <Bell className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Delivery Rate</p>
                      <p className="text-2xl font-bold text-white">{stats.delivery_rate.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Read Rate</p>
                      <p className="text-2xl font-bold text-white">{stats.read_rate.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-500/20">
                      <Eye className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Active Templates</p>
                      <p className="text-2xl font-bold text-white">{stats.active_templates}</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-500/20">
                      <MessageSquare className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Failed Messages</p>
                      <p className="text-2xl font-bold text-white">{stats.failed_messages}</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/20">
                      <XCircle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => toggleTemplateStatus(template.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setNewTemplate({
                            name: template.name,
                            content: template.content,
                            category: template.category,
                            variables: template.variables
                          });
                          setShowTemplateDialog(true);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category.replace('_', ' ')}
                  </Badge>
                  <p className="text-gray-300 text-sm mt-3 line-clamp-3">{template.content}</p>
                  {template.variables.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          {/* Filters */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bounce-back-consult-input text-white border-white/20"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {(messages || [])
              .filter(msg => 
                (searchTerm === '' || 
                 (msg.customer_name && typeof msg.customer_name === 'string' && msg.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 msg.customer_phone.includes(searchTerm)) &&
                (statusFilter === 'all' || msg.status === statusFilter)
              )
              .map((message) => (
              <Card key={message.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-white font-semibold">{message.customer_name || 'Unknown Customer'}</h3>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                        <span className="text-sm text-gray-400">{message.customer_phone}</span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{message.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Sent: {new Date(message.sent_at).toLocaleString()}</span>
                        {message.delivered_at && (
                          <span>Delivered: {new Date(message.delivered_at).toLocaleString()}</span>
                        )}
                        {message.read_at && (
                          <span>Read: {new Date(message.read_at).toLocaleString()}</span>
                        )}
                      </div>

                      {message.error_message && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            {message.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Purchase Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">New Purchase Notification</h4>
                    <p className="text-gray-300 text-sm">Send WhatsApp message when a new purchase is made</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Order Status Updates</h4>
                    <p className="text-gray-300 text-sm">Notify customers about order status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Payment Confirmations</h4>
                    <p className="text-gray-300 text-sm">Send payment confirmation messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Delivery Notifications</h4>
                    <p className="text-gray-300 text-sm">Notify when orders are delivered</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>WhatsApp Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Name
              </label>
              <Input
                value={newConfig.business_name}
                onChange={(e) => setNewConfig(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Your Business Name"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <Input
                value={newConfig.phone_number}
                onChange={(e) => setNewConfig(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="+1234567890"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                API Token
              </label>
              <Input
                type="password"
                value={newConfig.api_token}
                onChange={(e) => setNewConfig(prev => ({ ...prev, api_token: e.target.value }))}
                placeholder="Your WhatsApp Business API token"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Webhook URL (Optional)
              </label>
              <Input
                value={newConfig.webhook_url}
                onChange={(e) => setNewConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfigDialog(false)}
                className="bounce-back-consult-button-outline"
              >
                Cancel
              </Button>
              <Button
                onClick={saveConfig}
                className="bounce-back-consult-button"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Template Name
              </label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Purchase Notification"
                className="bounce-back-consult-input text-white border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <Select value={newTemplate.category} onValueChange={(value: any) => 
                setNewTemplate(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger className="bounce-back-consult-input text-white border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bounce-back-consult-card border-white/20">
                  <SelectItem value="purchase_notification">Purchase Notification</SelectItem>
                  <SelectItem value="order_update">Order Update</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Message Content
              </label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Hello {{customer_name}}, thank you for your purchase of {{product_name}} for {{amount}}. Your order #{{order_id}} is being processed."
                className="w-full h-32 p-3 bg-white/10 text-white border border-white/20 rounded-lg resize-none placeholder:text-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use variables like {'{{customer_name}}'}, {'{{product_name}}'}, {'{{amount}}'}, {'{{order_id}}'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
                className="bounce-back-consult-button-outline"
              >
                Cancel
              </Button>
              <Button
                onClick={saveTemplate}
                className="bounce-back-consult-button"
              >
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppIntegration;

