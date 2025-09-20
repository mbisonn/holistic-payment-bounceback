import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  Bug, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Activity,
  RefreshCw,
  Search,
  Info,
  Terminal,
  Database,
  AlertTriangle,
} from 'lucide-react';

interface TestRun {
  id: string;
  automation_id: string;
  automation_name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  start_time: string;
  end_time?: string;
  duration?: number;
  test_data: any;
  results: TestResult[];
  logs: LogEntry[];
  error?: string;
}

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'warning' | 'skipped';
  message: string;
  timestamp: string;
  duration: number;
  data?: any;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  source: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  trigger_data: any;
  expected_results: any[];
  is_active: boolean;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'new_customer',
    name: 'New Customer Signup',
    description: 'Test automation for new customer signup flow',
    trigger_data: {
      customer_email: 'test@example.com',
      customer_name: 'Test Customer',
      signup_source: 'website'
    },
    expected_results: [
      { action: 'send_email', status: 'success' },
      { action: 'assign_tag', tag: 'new_customer', status: 'success' },
      { action: 'create_task', status: 'success' }
    ],
    is_active: true
  },
  {
    id: 'purchase_test',
    name: 'Purchase Test',
    description: 'Test automation for purchase flow',
    trigger_data: {
      customer_email: 'customer@example.com',
      order_id: 'ORD-12345',
      amount: 99.99,
      products: ['Product A', 'Product B']
    },
    expected_results: [
      { action: 'send_email', status: 'success' },
      { action: 'assign_tag', tag: 'customer', status: 'success' },
      { action: 'webhook', status: 'success' }
    ],
    is_active: true
  },
  {
    id: 'abandoned_cart',
    name: 'Abandoned Cart',
    description: 'Test abandoned cart recovery flow',
    trigger_data: {
      customer_email: 'abandoned@example.com',
      cart_items: ['Product X', 'Product Y'],
      cart_value: 149.99,
      abandoned_at: new Date().toISOString()
    },
    expected_results: [
      { action: 'send_email', status: 'success' },
      { action: 'assign_tag', tag: 'abandoned_cart', status: 'success' }
    ],
    is_active: true
  }
];

const LOG_LEVELS = {
  info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  warn: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  debug: { icon: Bug, color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
};

export default function AutomationTesting() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [customTestData, setCustomTestData] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockTestRuns: TestRun[] = [
        {
          id: '1',
          automation_id: 'auto_1',
          automation_name: 'Welcome Series',
          status: 'completed',
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000).toISOString(),
          duration: 30,
          test_data: { customer_email: 'test@example.com' },
          results: [
            { step: 'Trigger validation', status: 'success', message: 'Customer signup trigger validated', timestamp: new Date().toISOString(), duration: 5 },
            { step: 'Email sending', status: 'success', message: 'Welcome email sent successfully', timestamp: new Date().toISOString(), duration: 15 },
            { step: 'Tag assignment', status: 'success', message: 'Tag "new_customer" assigned', timestamp: new Date().toISOString(), duration: 8 },
            { step: 'Task creation', status: 'success', message: 'Follow-up task created', timestamp: new Date().toISOString(), duration: 2 }
          ],
          logs: [
            { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Test run started', source: 'automation_engine' },
            { id: '2', timestamp: new Date().toISOString(), level: 'info', message: 'Trigger data validated', source: 'validation' },
            { id: '3', timestamp: new Date().toISOString(), level: 'info', message: 'Email sent to test@example.com', source: 'email_service' },
            { id: '4', timestamp: new Date().toISOString(), level: 'info', message: 'Test run completed successfully', source: 'automation_engine' }
          ]
        },
        {
          id: '2',
          automation_id: 'auto_2',
          automation_name: 'Abandoned Cart Recovery',
          status: 'failed',
          start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 1000).toISOString(),
          duration: 15,
          test_data: { customer_email: 'abandoned@example.com' },
          results: [
            { step: 'Trigger validation', status: 'success', message: 'Abandoned cart trigger validated', timestamp: new Date().toISOString(), duration: 3 },
            { step: 'Email sending', status: 'error', message: 'Failed to send email: Invalid template', timestamp: new Date().toISOString(), duration: 12 }
          ],
          logs: [
            { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Test run started', source: 'automation_engine' },
            { id: '2', timestamp: new Date().toISOString(), level: 'error', message: 'Email template not found', source: 'email_service' },
            { id: '3', timestamp: new Date().toISOString(), level: 'error', message: 'Test run failed', source: 'automation_engine' }
          ],
          error: 'Email template not found'
        },
        {
          id: '3',
          automation_id: 'auto_3',
          automation_name: 'Birthday Campaign',
          status: 'running',
          start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          test_data: { customer_email: 'birthday@example.com' },
          results: [
            { step: 'Trigger validation', status: 'success', message: 'Birthday trigger validated', timestamp: new Date().toISOString(), duration: 2 }
          ],
          logs: [
            { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Test run started', source: 'automation_engine' },
            { id: '2', timestamp: new Date().toISOString(), level: 'info', message: 'Trigger data validated', source: 'validation' },
            { id: '3', timestamp: new Date().toISOString(), level: 'info', message: 'Sending birthday email...', source: 'email_service' }
          ]
        }
      ];

      setTestRuns(mockTestRuns);
    } catch (error) {
      console.error('Error fetching test runs:', error);
    }
  };

  const runTest = async (scenario: TestScenario) => {
    const testRunId = `test_${Date.now()}`;
    setRunningTests(prev => new Set([...prev, testRunId]));
    
    try {
      // Mock test execution
      const testRun: TestRun = {
        id: testRunId,
        automation_id: 'auto_1',
        automation_name: scenario.name,
        status: 'running',
        start_time: new Date().toISOString(),
        test_data: scenario.trigger_data,
        results: [],
        logs: [
          { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Test run started', source: 'automation_engine' }
        ]
      };

      setTestRuns(prev => [testRun, ...prev]);

      // Simulate test execution
      setTimeout(() => {
        const completedRun: TestRun = {
          ...testRun,
          status: 'completed',
          end_time: new Date().toISOString(),
          duration: Math.floor(Math.random() * 30) + 10,
          results: scenario.expected_results.map((result, index) => ({
            step: `Step ${index + 1}`,
            status: result.status as any,
            message: `${result.action} executed successfully`,
            timestamp: new Date().toISOString(),
            duration: Math.floor(Math.random() * 10) + 1,
            data: result
          })),
          logs: [
            ...testRun.logs,
            { id: '2', timestamp: new Date().toISOString(), level: 'info', message: 'All steps completed successfully', source: 'automation_engine' }
          ]
        };

        setTestRuns(prev => prev.map(run => run.id === testRunId ? completedRun : run));
        setRunningTests(prev => {
          const newSet = new Set(prev);
          newSet.delete(testRunId);
          return newSet;
        });

        toast({
          title: 'Test Completed',
          description: 'Automation test completed successfully'
        });
      }, 3000);

    } catch (error) {
      console.error('Error running test:', error);
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testRunId);
        return newSet;
      });
      toast({
        title: 'Test Failed',
        description: 'Failed to run automation test',
        variant: 'destructive'
      });
    }
  };

  const stopTest = (testRunId: string) => {
    setTestRuns(prev => prev.map(run => 
      run.id === testRunId ? { ...run, status: 'paused' as const } : run
    ));
    setRunningTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(testRunId);
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'running': return Activity;
      case 'paused': return Pause;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-blue-400';
      case 'paused': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'skipped': return Minus;
      default: return Clock;
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'skipped': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTestRuns = testRuns.filter(run => {
    const matchesStatus = filterStatus === 'all' || run.status === filterStatus;
    const matchesSearch = run.automation_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Automation Testing</h2>
          <p className="text-gray-300">Test and debug your automations before going live</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowTestDialog(true)} className="glass-button">
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </Button>
          <Button onClick={fetchTestRuns} variant="outline" className="glass-button-outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search test runs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-input text-white border-white/20"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] glass-input text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Runs */}
      <div className="space-y-4">
        {filteredTestRuns.length === 0 ? (
          <Card className="glass-card border-white/20">
            <CardContent className="text-center py-12">
              <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No test runs found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Run your first test to start debugging your automations.'
                }
              </p>
              <Button onClick={() => setShowTestDialog(true)} className="glass-button">
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTestRuns.map((run) => {
            const StatusIcon = getStatusIcon(run.status);
            
            return (
              <Card key={run.id} className="glass-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(run.status)}`} />
                      <div>
                        <h3 className="text-white font-semibold text-lg">{run.automation_name}</h3>
                        <p className="text-sm text-gray-400">
                          Started: {new Date(run.start_time).toLocaleString()}
                          {run.duration && ` • Duration: ${run.duration}s`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {run.status === 'running' && (
                        <Button
                          onClick={() => stopTest(run.id)}
                          variant="outline"
                          size="sm"
                          className="glass-button-outline"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedRun(run)}
                        variant="outline"
                        size="sm"
                        className="glass-button-outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total Steps</p>
                      <p className="text-white font-semibold">{run.results.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Successful</p>
                      <p className="text-green-400 font-semibold">
                        {run.results.filter(r => r.status === 'success').length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Failed</p>
                      <p className="text-red-400 font-semibold">
                        {run.results.filter(r => r.status === 'error').length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Warnings</p>
                      <p className="text-yellow-400 font-semibold">
                        {run.results.filter(r => r.status === 'warning').length}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {run.status === 'running' && (
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  )}

                  {/* Error Message */}
                  {run.error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-red-300">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Error:</span>
                        <span>{run.error}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="glass-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Run Automation Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Test Scenario</Label>
              <Select value={selectedScenario?.id || ''} onValueChange={(value) => 
                setSelectedScenario(TEST_SCENARIOS.find(s => s.id === value) || null)
              }>
                <SelectTrigger className="glass-input text-white border-white/20">
                  <SelectValue placeholder="Select a test scenario" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  {TEST_SCENARIOS.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScenario && (
              <div>
                <Label className="text-white">Test Data (JSON)</Label>
                <Textarea
                  value={customTestData || JSON.stringify(selectedScenario.trigger_data, null, 2)}
                  onChange={(e) => setCustomTestData(e.target.value)}
                  className="glass-input text-white border-white/20 font-mono text-sm"
                  rows={8}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTestDialog(false)} className="glass-button-outline">
                Cancel
              </Button>
              <Button 
                onClick={() => selectedScenario && runTest(selectedScenario)} 
                disabled={!selectedScenario}
                className="glass-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Run Details Dialog */}
      {selectedRun && (
        <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
          <DialogContent className="glass-card border-white/20 text-white sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Test Run Details</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="results" className="space-y-4">
              <TabsList className="glass-card border-white/20 bg-transparent">
                <TabsTrigger value="results" className="text-white data-[state=active]:bg-white/20">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="logs" className="text-white data-[state=active]:bg-white/20">
                  <Terminal className="h-4 w-4 mr-2" />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="data" className="text-white data-[state=active]:bg-white/20">
                  <Database className="h-4 w-4 mr-2" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <div className="space-y-3">
                  {selectedRun.results.map((result, index) => {
                    const ResultIcon = getResultIcon(result.status);
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <ResultIcon className={`h-5 w-5 ${getResultColor(result.status)}`} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{result.step}</p>
                          <p className="text-sm text-gray-400">{result.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{result.duration}ms</p>
                          <Badge variant={result.status === 'success' ? 'default' : 'secondary'}>
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedRun.logs.map((log) => {
                    const LogLevel = LOG_LEVELS[log.level];
                    
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <LogLevel.icon className={`h-4 w-4 mt-0.5 ${LogLevel.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">{log.timestamp}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          </div>
                          <p className="text-white text-sm">{log.message}</p>
                          {log.data && (
                            <pre className="text-xs text-gray-400 mt-2 bg-black/20 p-2 rounded">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Test Data</h4>
                  <pre className="bg-black/20 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedRun.test_data, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
