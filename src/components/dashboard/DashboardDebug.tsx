import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testDashboardFunctionality, debugDashboardIssues, getDashboardStatus } from '@/utils/dashboardTestUtils';
import { useAuth } from '@/hooks/useAuth';
import { Bug, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { testDatabaseTables, checkTablePermissions } from '@/utils/testDatabaseTables';

const DashboardDebug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [tableStatus, setTableStatus] = useState<{ [key: string]: boolean }>({});
  const [permissionStatus, setPermissionStatus] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await testDashboardFunctionality({
        testAuth: true,
        testDataFetching: true,
        testUIElements: true,
        testLogout: true
      });
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDebug = () => {
    const debug = debugDashboardIssues();
    setDebugInfo(debug);
  };

  const getStatus = () => {
    const status = getDashboardStatus();
    console.log('Dashboard Status:', status);
    return status;
  };

  const runDatabaseTests = async () => {
    setTesting(true);
    try {
      const tableResults = await testDatabaseTables();
      setTableStatus(tableResults);
      
      const permissionResults = await checkTablePermissions();
      setPermissionStatus(permissionResults);
      
      toast({
        title: 'Database Test Complete',
        description: 'Check console for detailed results'
      });
    } catch (error) {
      toast({
        title: 'Database Test Failed',
        description: 'Error running database tests',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on mount if in development
    if (process.env.NODE_ENV === 'development') {
      runTests();
      runDebug();
    }
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 glass-button"
        size="sm"
      >
        <Bug className="w-4 h-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Dashboard Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Results */}
          <div>
            <h3 className="font-semibold mb-2">Test Results</h3>
            {testResults ? (
              <div className="space-y-2">
                {Object.entries(testResults).map(([test, result]: [string, any]) => (
                  <div key={test} className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="capitalize">{test}:</span>
                    <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                      {result.passed ? 'PASSED' : result.error || 'FAILED'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No test results available</p>
            )}
          </div>

          {/* Debug Info */}
          <div>
            <h3 className="font-semibold mb-2">Debug Information</h3>
            {debugInfo ? (
              <div className="space-y-2">
                {debugInfo.issues.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-red-500">Issues Found:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {debugInfo.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm text-red-400">{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>No issues detected</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No debug information available</p>
            )}
          </div>

          {/* Current User Info */}
          <div>
            <h3 className="font-semibold mb-2">Current User</h3>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
              <p><strong>ID:</strong> {currentUser?.id || 'N/A'}</p>
              <p><strong>Last Sign In:</strong> {currentUser?.last_sign_in_at || 'N/A'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={runTests} disabled={isRunning} className="glass-button">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
            <Button onClick={runDebug} className="glass-button-outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Debug Issues
            </Button>
            <Button onClick={getStatus} className="glass-button-outline">
              Get Status
            </Button>
            <Button onClick={runDatabaseTests} disabled={testing} className="glass-button">
              {testing ? 'Testing...' : 'Test Database Tables'}
            </Button>
            <Button onClick={() => setIsVisible(false)} className="glass-button-outline">
              Close
            </Button>
          </div>

          {/* Database Debug Section */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="font-semibold mb-2 text-white">Database Debug</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Table Accessibility</h4>
                {Object.entries(tableStatus).map(([table, accessible]) => (
                  <div key={table} className="flex items-center gap-2 mb-1">
                    <Badge variant={accessible ? 'default' : 'destructive'}>
                      {accessible ? '✅' : '❌'}
                    </Badge>
                    <span className="text-sm text-white">{table}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Write Permissions</h4>
                {Object.entries(permissionStatus).map(([table, writable]) => (
                  <div key={table} className="flex items-center gap-2 mb-1">
                    <Badge variant={writable ? 'default' : 'destructive'}>
                      {writable ? '✅' : '❌'}
                    </Badge>
                    <span className="text-sm text-white">{table}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-4">
              <p>Current User: {currentUser?.email || 'Not logged in'}</p>
              <p>Admin Status: {isAdmin ? 'Admin' : 'Not Admin'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDebug; 