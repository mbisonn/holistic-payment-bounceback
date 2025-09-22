import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  Users,
  Mail,
  MessageSquare,
  ShoppingCart,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Heart,
  Zap,
  Target,
  DollarSign
} from 'lucide-react';
import { ArrowRight, Settings } from 'lucide-react';

interface AutomationStats {
  id: string;
  name: string;
  trigger: string;
  action: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  avg_execution_time: number;
  last_run: string;
  created_at: string;
  revenue_generated: number;
  emails_sent: number;
  sms_sent: number;
  tags_assigned: number;
  tasks_created: number;
  webhooks_called: number;
}

const METRICS = [
  {
    id: 'total_runs',
    name: 'Total Runs',
    icon: Activity,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    id: 'success_rate',
    name: 'Success Rate',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    id: 'revenue_generated',
    name: 'Revenue Generated',
    icon: DollarSign,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  {
    id: 'emails_sent',
    name: 'Emails Sent',
    icon: Mail,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  }
];

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

export default function AutomationAnalytics() {
  const [stats, setStats] = useState<AutomationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: AutomationStats[] = [
        {
          id: '1',
          name: 'Welcome Series',
          trigger: 'customer_signup',
          action: 'send_email_campaign',
          total_runs: 1247,
          successful_runs: 1189,
          failed_runs: 58,
          success_rate: 95.3,
          avg_execution_time: 2.3,
          last_run: new Date().toISOString(),
          created_at: '2024-01-15T00:00:00Z',
          revenue_generated: 15420,
          emails_sent: 1189,
          sms_sent: 0,
          tags_assigned: 1247,
          tasks_created: 0,
          webhooks_called: 0
        }
      ];

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalMetric = (metric: string) => {
    return stats.reduce((sum, stat) => sum + (stat[metric as keyof AutomationStats] as number), 0);
  };

  const getAverageMetric = (metric: string) => {
    const total = getTotalMetric(metric);
    return stats.length > 0 ? total / stats.length : 0;
  };

  const getTopPerformers = (metric: string, limit: number = 3) => {
    return [...stats]
      .sort((a, b) => (b[metric as keyof AutomationStats] as number) - (a[metric as keyof AutomationStats] as number))
      .slice(0, limit);
  };

  const getTriggerIcon = (trigger: string) => {
    const icons: { [key: string]: any } = {
      'customer_signup': Users,
      'abandoned_cart': ShoppingCart,
      'birthday': Heart,
      'purchase_paystack': DollarSign,
      'email_opened': Eye,
      'email_clicked': MousePointer
    };
    return icons[trigger] || Zap;
  };

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: any } = {
      'send_email': Mail,
      'send_email_campaign': Mail,
      'send_sms': MessageSquare,
      'assign_tag': Target,
      'create_task': CheckCircle,
      'webhook': Zap
    };
    return icons[action] || Settings;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-white">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Automation Analytics</h2>
          <p className="text-gray-300">Track performance and optimize your automations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bounce-back-consult-input text-white border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bounce-back-consult-card border-white/20">
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" className="bounce-back-consult-button-outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="bounce-back-consult-button-outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(metric => {
          const Icon = metric.icon;
          const value = getTotalMetric(metric.id);
          const formattedValue = metric.id === 'revenue_generated' 
            ? `$${value.toLocaleString()}` 
            : metric.id === 'success_rate' 
            ? `${getAverageMetric(metric.id).toFixed(1)}%`
            : value.toLocaleString();
          
          return (
            <Card key={metric.id} className="bounce-back-consult-card border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{metric.name}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>{formattedValue}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bounce-back-consult-card border-white/20 bg-transparent">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-white/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bounce-back-consult-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Automations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopPerformers('success_rate').map((automation) => {
                    const TriggerIcon = getTriggerIcon(automation.trigger);
                    const ActionIcon = getActionIcon(automation.action);
                    
                    return (
                      <div key={automation.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <TriggerIcon className="h-4 w-4 text-blue-400" />
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <ActionIcon className="h-4 w-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{automation.name}</p>
                            <p className="text-sm text-gray-400">{automation.total_runs} runs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="bg-green-500/20 text-green-300">
                            {automation.success_rate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bounce-back-consult-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopPerformers('revenue_generated').map((automation) => {
                    const TriggerIcon = getTriggerIcon(automation.trigger);
                    const ActionIcon = getActionIcon(automation.action);
                    
                    return (
                      <div key={automation.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <TriggerIcon className="h-4 w-4 text-blue-400" />
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <ActionIcon className="h-4 w-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{automation.name}</p>
                            <p className="text-sm text-gray-400">{automation.total_runs} runs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold">
                            ${automation.revenue_generated.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map(automation => {
                  const TriggerIcon = getTriggerIcon(automation.trigger);
                  const ActionIcon = getActionIcon(automation.action);
                  
                  return (
                    <div key={automation.id} className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <TriggerIcon className="h-4 w-4 text-blue-400" />
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <ActionIcon className="h-4 w-4 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{automation.name}</h3>
                            <p className="text-sm text-gray-400">
                              {automation.trigger.replace('_', ' ')} → {automation.action.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={automation.success_rate >= 95 ? "default" : "secondary"}>
                          {automation.success_rate.toFixed(1)}% success
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Total Runs</p>
                          <p className="text-white font-semibold">{automation.total_runs.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Successful</p>
                          <p className="text-green-400 font-semibold">{automation.successful_runs.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Failed</p>
                          <p className="text-red-400 font-semibold">{automation.failed_runs.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Revenue</p>
                          <p className="text-yellow-400 font-semibold">${automation.revenue_generated.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}