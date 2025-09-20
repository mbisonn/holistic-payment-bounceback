import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Users, Calendar, Settings } from 'lucide-react';

interface AutoSyncSettings {
  id: string;
  is_enabled: boolean;
  sync_frequency: number; // in hours
  last_sync: string | null;
  total_synced: number;
}

const AutoMealPlanSync = () => {
  const [autoSyncSettings, setAutoSyncSettings] = useState<AutoSyncSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAutoSyncSettings();
    // Set up automatic sync check every hour
    const interval = setInterval(checkAndPerformSync, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  const fetchAutoSyncSettings = async () => {
    try {
      // Create default settings if none exist
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('name', 'Auto Meal Plan Sync')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default auto-sync settings
        const { data: newSettings, error: createError } = await supabase
          .from('automation_rules')
          .insert({
            name: 'Auto Meal Plan Sync',
            trigger: 'time_based',
            action: 'meal_plan_sync',
            trigger_data: JSON.stringify({ frequency_hours: 24 }),
            action_data: JSON.stringify({ total_synced: 0 }),
            is_active: true
          })
          .select()
          .single();

        if (createError) throw createError;

        setAutoSyncSettings({
          id: newSettings.id,
          is_enabled: true,
          sync_frequency: 24,
          last_sync: null,
          total_synced: 0
        });
      } else {
        const triggerData = typeof data.trigger_data === 'string' 
          ? JSON.parse(data.trigger_data) 
          : data.trigger_data || {};
        const actionData = typeof data.action_data === 'string' 
          ? JSON.parse(data.action_data) 
          : data.action_data || {};

        setAutoSyncSettings({
          id: data.id,
          is_enabled: data.is_active,
          sync_frequency: triggerData.frequency_hours || 24,
          last_sync: triggerData.last_sync || null,
          total_synced: actionData.total_synced || 0
        });
      }
    } catch (error) {
      console.error('Error fetching auto-sync settings:', error);
      toast({
        title: "Error",
        description: "Failed to load auto-sync settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndPerformSync = async () => {
    if (!autoSyncSettings?.is_enabled) return;

    const now = new Date();
    const lastSync = autoSyncSettings.last_sync ? new Date(autoSyncSettings.last_sync) : null;
    const hoursSinceLastSync = lastSync 
      ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (hoursSinceLastSync >= autoSyncSettings.sync_frequency) {
      await performAutoSync();
    }
  };

  const performAutoSync = async () => {
    setSyncing(true);
    try {
      // Get recent orders that might need meal plan sync
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, customer_name, customer_phone, created_at')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;

      let syncedCount = 0;

      for (const order of orders || []) {
        // Check if already synced
        const { data: existing } = await supabase
          .from('meal_plan_sync')
          .select('id')
          .eq('customer_email', order.customer_email)
          .single();

        if (!existing) {
          try {
            // Generate external user ID
            const externalUserId = `auto_${order.customer_email.replace('@', '_').replace('.', '_')}_${Date.now()}`;

            // Simulate meal plan data fetch (in real scenario, you'd call the external API)
            const mealPlanData = {
              userId: externalUserId,
              status: 'auto_synced',
              syncedAt: new Date().toISOString()
            };

            // Insert sync record
            await supabase.from('meal_plan_sync').insert({
              customer_email: order.customer_email,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              external_user_id: externalUserId,
              meal_plan_data: mealPlanData,
              synced_at: new Date().toISOString()
            });

            syncedCount++;
          } catch (syncError) {
            console.error(`Failed to sync ${order.customer_email}:`, syncError);
          }
        }
      }

      // Update auto-sync settings
      const updatedSettings = {
        ...autoSyncSettings,
        last_sync: new Date().toISOString(),
        total_synced: (autoSyncSettings?.total_synced || 0) + syncedCount
      };

      await supabase
        .from('automation_rules')
        .update({
          trigger_data: JSON.stringify({
            frequency_hours: autoSyncSettings?.sync_frequency || 24,
            last_sync: updatedSettings.last_sync
          }),
          action_data: JSON.stringify({
            total_synced: updatedSettings.total_synced
          })
        })
        .eq('id', autoSyncSettings?.id || '');

      if (autoSyncSettings?.id) {
        setAutoSyncSettings({
          id: autoSyncSettings.id,
          is_enabled: autoSyncSettings.is_enabled,
          sync_frequency: autoSyncSettings.sync_frequency,
          last_sync: updatedSettings.last_sync,
          total_synced: updatedSettings.total_synced
        });
      }

      if (syncedCount > 0) {
        toast({
          title: "Auto-sync completed",
          description: `Successfully synced ${syncedCount} new customers`,
        });
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
      toast({
        title: "Auto-sync failed",
        description: "Failed to perform automatic meal plan sync",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const toggleAutoSync = async (enabled: boolean) => {
    if (!autoSyncSettings) return;

    try {
      await supabase
        .from('automation_rules')
        .update({ is_active: enabled })
        .eq('id', autoSyncSettings.id);

      setAutoSyncSettings(prev => prev ? { ...prev, is_enabled: enabled } : null);

      toast({
        title: "Settings updated",
        description: `Auto-sync ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-sync settings",
        variant: "destructive",
      });
    }
  };

  const updateSyncFrequency = async (hours: number) => {
    if (!autoSyncSettings) return;

    try {
      await supabase
        .from('automation_rules')
        .update({
          trigger_data: JSON.stringify({
            frequency_hours: hours,
            last_sync: autoSyncSettings.last_sync
          })
        })
        .eq('id', autoSyncSettings.id);

      setAutoSyncSettings(prev => prev ? { ...prev, sync_frequency: hours } : null);

      toast({
        title: "Frequency updated",
        description: `Auto-sync will run every ${hours} hours`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sync frequency",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading auto-sync settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Automatic Meal Plan Sync</span>
          </CardTitle>
          <CardDescription>
            Automatically sync customer meal plan data in the background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Auto-Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync meal plan data for new customers
              </p>
            </div>
            <Switch
              checked={autoSyncSettings?.is_enabled || false}
              onCheckedChange={toggleAutoSync}
            />
          </div>

          {/* Sync Frequency */}
          <div>
            <h4 className="font-medium mb-2">Sync Frequency</h4>
            <div className="flex space-x-2">
              {[6, 12, 24, 48].map((hours) => (
                <Button
                  key={hours}
                  variant={autoSyncSettings?.sync_frequency === hours ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSyncFrequency(hours)}
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-xs text-muted-foreground">
                  {autoSyncSettings?.last_sync 
                    ? new Date(autoSyncSettings.last_sync).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Synced</p>
                <p className="text-xs text-muted-foreground">
                  {autoSyncSettings?.total_synced || 0} customers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded">
                <Settings className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={autoSyncSettings?.is_enabled ? "default" : "secondary"}>
                  {syncing ? "Syncing..." : autoSyncSettings?.is_enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Manual Sync */}
          <div className="pt-4 border-t">
            <Button 
              onClick={performAutoSync} 
              disabled={syncing || !autoSyncSettings?.is_enabled}
              className="w-full md:w-auto"
            >
              {syncing ? "Syncing..." : "Run Manual Sync"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoMealPlanSync;