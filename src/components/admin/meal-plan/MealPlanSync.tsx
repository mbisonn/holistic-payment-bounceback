import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MealPlanData {
  id: string;
  customer_email: string;
  meal_plan_data: any;
  last_synced_at: string | null;
  created_at: string | null;
  sync_status: string | null;
  updated_at: string | null;
}

const MealPlanSync = () => {
  const [syncData, setSyncData] = useState<MealPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [externalUserId, setExternalUserId] = useState('');
  const { toast } = useToast();

  const MEAL_PLAN_APP_URL = 'https://afro-wellness-planner-ai.lovable.app';

  useEffect(() => {
    fetchSyncData();
  }, []);

  const fetchSyncData = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plan_sync')
        .select('*')
        .order('last_synced_at', { ascending: false });

      if (error) throw error;
      setSyncData((data || []) as MealPlanData[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch meal plan sync data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!customerEmail || !externalUserId) {
      toast({
        description: "Please enter both customer email and external user ID",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      // Call the meal plan app API to get user data
      const response = await fetch(`${MEAL_PLAN_APP_URL}/api/sync-user/${externalUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync with meal plan app');
      }

      const mealPlanData = await response.json();

      // Store the synced data in our database
      const { error } = await supabase
        .from('meal_plan_sync')
        .insert([{
          customer_email: customerEmail,
          meal_plan_data: mealPlanData,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal plan data synced successfully",
      });

      setCustomerEmail('');
      setExternalUserId('');
      fetchSyncData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync meal plan data. Please check the external user ID.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const openMealPlanApp = () => {
    window.open(MEAL_PLAN_APP_URL, '_blank');
  };

  if (loading) {
    return <div className="p-6">Loading meal plan sync data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meal Plan Synchronization</h1>
          <p className="text-muted-foreground">Sync customer data with the Afro Wellness Planner app</p>
        </div>
        <Button onClick={openMealPlanApp} variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Meal Plan App
        </Button>
      </div>

      {/* Sync Form */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Sync New Customer</CardTitle>
          <CardDescription className="text-white/70">
            Enter customer details to sync their meal plan data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerEmail" className="text-white">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="externalUserId" className="text-white">External User ID</Label>
              <Input
                id="externalUserId"
                value={externalUserId}
                onChange={(e) => setExternalUserId(e.target.value)}
                placeholder="user-id-from-meal-plan-app"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <Button onClick={handleSync} disabled={syncing} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Synced Data */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Synced Customers ({syncData.length})
          </CardTitle>
          <CardDescription className="text-white/70">
            Customers synchronized with the meal plan app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncData.length === 0 ? (
            <p className="text-white/70 text-center py-8">No synchronized customers yet</p>
          ) : (
            <div className="space-y-4">
              {syncData.map((sync) => (
                <div key={sync.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{sync.customer_email}</h4>
                      <p className="text-sm text-white/70">Status: {sync.sync_status || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        Synced {sync.last_synced_at ? new Date(sync.last_synced_at).toLocaleDateString() : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanSync;