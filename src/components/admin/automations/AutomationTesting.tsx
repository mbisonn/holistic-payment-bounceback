import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  AlertTriangle,
  Minus,
  Pause
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
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  
  
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
            { step: 'Email sending', status: 'success', message: 'Welcome email sent successfully', timestamp: new Date().toISOString(), duration: 15 }
          ],
          logs: [
            { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Test run started', source: 'automation_engine' }
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
    setRunningTests((prev: Set<string>) => new Set([...prev, testRunId]));
    
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
        setRunningTests((prev: Set<string>) => {
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
      setRunningTests((prev: Set<string>) => {
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
    setRunningTests((prev: Set<string>) => {
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
          <Button onClick={() => setShowTestDialog(true)} className="bounce-back-consult-button">
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </Button>
          <Button onClick={fetchTestRuns} variant="outline" className="bounce-back-consult-button-outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bounce-back-consult-card border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search test runs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bounce-back-consult-input text-white border-white/20"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bounce-back-consult-card border-white/20">
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
          <Card className="bounce-back-consult-card border-white/20">
            <CardContent className="text-center py-12">
              <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No test runs found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Run your first test to start debugging your automations.'
                }
              </p>
              <Button onClick={() => setShowTestDialog(true)} className="bounce-back-consult-button">
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTestRuns.map((run) => {
            const StatusIcon = getStatusIcon(run.status);
            
            return (
              <Card key={run.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
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
                          className="bounce-back-consult-button-outline"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedRun(run)}
                        variant="outline"
                        size="sm"
                        className="bounce-back-consult-button-outline"
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
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge 
                        variant={run.status === 'completed' ? "default" : run.status === 'failed' ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {run.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Latest Results */}
                  {run.results.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Latest Results:</h4>
                      <div className="space-y-1">
                        {run.results.slice(0, 3).map((result, index) => {
                          const ResultIcon = getResultIcon(result.status);
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <ResultIcon className={`h-3 w-3 ${getResultColor(result.status)}`} />
                              <span className="text-gray-300">{result.step}</span>
                              <span className="text-gray-500">•</span>
                              <span className={getResultColor(result.status)}>{result.message}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Test Scenario Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Run Automation Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">Select a test scenario to run:</p>
            <div className="space-y-3">
              {TEST_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedScenario?.id === scenario.id
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-white/20 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <h3 className="text-white font-medium mb-1">{scenario.name}</h3>
                  <p className="text-sm text-gray-400">{scenario.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTestDialog(false)} 
                className="bounce-back-consult-button-outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedScenario) {
                    runTest(selectedScenario);
                    setShowTestDialog(false);
                    setSelectedScenario(null);
                  }
                }}
                disabled={!selectedScenario}
                className="bounce-back-consult-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Details Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Run Details: {selectedRun?.automation_name}</DialogTitle>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-6">
              {/* Test Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge variant={selectedRun.status === 'completed' ? "default" : "secondary"} className="capitalize">
                    {selectedRun.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="text-white">{selectedRun.duration ? `${selectedRun.duration}s` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Started</p>
                  <p className="text-white">{new Date(selectedRun.start_time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-white">
                    {selectedRun.end_time ? new Date(selectedRun.end_time).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
                <div className="space-y-3">
                  {selectedRun.results.map((result, index) => {
                    const ResultIcon = getResultIcon(result.status);
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <ResultIcon className={`h-5 w-5 mt-0.5 ${getResultColor(result.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{result.step}</h4>
                            <span className="text-sm text-gray-400">{result.duration}ms</span>
                          </div>
                          <p className="text-sm text-gray-300">{result.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logs */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Execution Logs</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedRun.logs.map((log) => {
                    const LogIcon = LOG_LEVELS[log.level].icon;
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-2 rounded text-sm">
                        <LogIcon className={`h-4 w-4 mt-0.5 ${LOG_LEVELS[log.level].color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={LOG_LEVELS[log.level].color}>[{log.level.toUpperCase()}]</span>
                            <span className="text-gray-500">{log.source}</span>
                          </div>
                          <p className="text-white">{log.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}