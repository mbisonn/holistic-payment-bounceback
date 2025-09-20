import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Code, BarChart3, Save, Trash2, Plus, Edit } from 'lucide-react';

interface GTMSetting {
  id: string;
  name: string;
  gtm_id: string;
  is_active: boolean;
  custom_events: any;
  created_at: string;
  updated_at: string;
}

const GTMSettings = () => {
  const [gtmSettings, setGtmSettings] = useState<GTMSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gtm_id: '',
    is_active: true,
    custom_events: {
      purchase: true,
      add_to_cart: true,
      abandoned_cart: true,
      page_view: true
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGTMSettings();
    // Initialize default GTM setting if none exists
    initializeDefaultGTM();
  }, []);

  const fetchGTMSettings = async () => {
    try {
      // Use automation_rules table to store GTM settings
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('action', 'gtm_tracking')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const gtmData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        gtm_id: item.trigger_data ? JSON.parse(item.trigger_data as string).gtm_id : '',
        is_active: item.is_active,
        custom_events: item.action_data ? JSON.parse(item.action_data as string) : {},
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setGtmSettings(gtmData);
    } catch (error) {
      console.error('Error fetching GTM settings:', error);
      toast({
        title: "Error",
        description: "Failed to load GTM settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultGTM = async () => {
    try {
      // Check if default GTM exists
      const { data: existing } = await supabase
        .from('automation_rules')
        .select('id')
        .eq('name', 'Default GTM Tracking')
        .eq('action', 'gtm_tracking')
        .single();

      if (!existing) {
        // Create default GTM setting with the provided GTM ID
        await supabase.from('automation_rules').insert({
          name: 'Default GTM Tracking',
          trigger: 'page_load',
          action: 'gtm_tracking',
          trigger_data: JSON.stringify({ gtm_id: 'GTM-MQ6HKDRG' }),
          action_data: JSON.stringify({
            purchase: true,
            add_to_cart: true,
            abandoned_cart: true,
            page_view: true
          }),
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error initializing default GTM:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const gtmData = {
        name: formData.name,
        trigger: 'page_load',
        action: 'gtm_tracking',
        trigger_data: JSON.stringify({ gtm_id: formData.gtm_id }),
        action_data: JSON.stringify(formData.custom_events),
        is_active: formData.is_active
      };

      if (editingId) {
        const { error } = await supabase
          .from('automation_rules')
          .update(gtmData)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: "Success", description: "GTM setting updated successfully" });
      } else {
        const { error } = await supabase
          .from('automation_rules')
          .insert([gtmData]);
        if (error) throw error;
        toast({ title: "Success", description: "GTM setting created successfully" });
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchGTMSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save GTM setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this GTM setting?')) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "GTM setting deleted successfully" });
      fetchGTMSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete GTM setting",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (setting: GTMSetting) => {
    setEditingId(setting.id);
    setFormData({
      name: setting.name,
      gtm_id: setting.gtm_id,
      is_active: setting.is_active,
      custom_events: setting.custom_events || {
        purchase: true,
        add_to_cart: true,
        abandoned_cart: true,
        page_view: true
      }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gtm_id: '',
      is_active: true,
      custom_events: {
        purchase: true,
        add_to_cart: true,
        abandoned_cart: true,
        page_view: true
      }
    });
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success", 
        description: `GTM tracking ${isActive ? 'enabled' : 'disabled'}`
      });
      fetchGTMSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update GTM setting",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading GTM settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Google Tag Manager Settings</h2>
          <p className="text-gray-300">Configure GTM tracking and events</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="glass-button">
          <Plus className="mr-2 h-4 w-4" />
          Add GTM Configuration
        </Button>
      </div>

      {/* Current GTM Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gtmSettings.map((setting) => (
          <Card key={setting.id} className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  <span>{setting.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={setting.is_active}
                    onCheckedChange={(checked) => toggleActive(setting.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(setting)}
                    className="glass-button-outline"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(setting.id)}
                    className="glass-button-outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-gray-300">GTM ID: {setting.gtm_id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Status:</span>
                <Badge variant={setting.is_active ? "default" : "secondary"} className={setting.is_active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'glass-secondary'}>
                  {setting.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-white">Tracked Events:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(setting.custom_events || {}).map(([event, enabled]) => 
                    enabled ? (
                      <Badge key={event} variant="outline" className="text-xs glass-secondary">
                        {event.replace('_', ' ')}
                      </Badge>
                    ) : null
                  ).filter(Boolean)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gtmSettings.length === 0 && (
        <Card className="glass-card border-white/20">
          <CardContent className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-white/60 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No GTM configurations</h3>
            <p className="text-gray-300 mb-4">
              Set up Google Tag Manager to track events and conversions
            </p>
            <Button onClick={() => setShowForm(true)} className="glass-button">
              <Plus className="mr-2 h-4 w-4" />
              Add First Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configuration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingId ? 'Edit GTM Configuration' : 'Add GTM Configuration'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="glass-button-outline"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Configuration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main Website GTM"
                    className="glass-input text-white border-white/20"
                  />
                </div>

                <div>
                  <Label htmlFor="gtm_id" className="text-white">GTM Container ID</Label>
                  <Input
                    id="gtm_id"
                    value={formData.gtm_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, gtm_id: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                    className="glass-input text-white border-white/20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-white">Event Tracking</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(formData.custom_events).map(([event, enabled]) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              custom_events: {
                                ...prev.custom_events,
                                [event]: checked
                              }
                            }))
                          }
                        />
                        <Label className="capitalize text-white">{event.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label className="text-white">Enable this configuration</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className="glass-button-outline"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="glass-button">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GTM Code Instructions */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Code className="h-5 w-5" />
            <span>Implementation Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300 mb-4">
            Your GTM code has been automatically implemented. The current configuration tracks:
          </p>
          <ul className="text-sm space-y-1 mb-4">
            <li className="text-white">• Purchase events with transaction data</li>
            <li className="text-white">• Add to cart events</li>
            <li className="text-white">• Abandoned cart tracking</li>
            <li className="text-white">• Page view events</li>
          </ul>
          <div className="bg-white/5 p-4 rounded text-sm border border-white/10">
            <p className="font-medium mb-2 text-white">Current GTM ID: GTM-MQ6HKDRG</p>
            <p className="text-gray-300">
              Data layer events are automatically pushed for e-commerce tracking compatible with GA4.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GTMSettings;