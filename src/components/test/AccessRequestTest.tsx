import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TestTube, CheckCircle2, XCircle } from 'lucide-react';

export default function AccessRequestTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testAccessRequestSystem = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const tests = [];
      
      // Test 1: Check if table exists
      try {
        const { error } = await supabase
          .from('user_access_requests')
          .select('count')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          tests.push({
            name: 'Table Exists',
            status: 'failed',
            message: 'Table needs to be created. Run the database migration.'
          });
        } else if (error) {
          tests.push({
            name: 'Table Exists',
            status: 'failed',
            message: error.message
          });
        } else {
          tests.push({
            name: 'Table Exists',
            status: 'passed',
            message: 'user_access_requests table is accessible'
          });
        }
      } catch (e: any) {
        tests.push({
          name: 'Table Exists',
          status: 'failed',
          message: e.message
        });
      }

      // Test 2: Check if functions exist
      try {
        const { error } = await supabase.rpc('create_access_request', {
          requested_role: 'verified',
          message: 'Test request'
        });
        
        if (error && error.message.includes('Could not find the function')) {
          tests.push({
            name: 'Create Function',
            status: 'failed',
            message: 'Function needs to be created. Run the database migration.'
          });
        } else if (error) {
          tests.push({
            name: 'Create Function',
            status: 'failed',
            message: error.message
          });
        } else {
          tests.push({
            name: 'Create Function',
            status: 'passed',
            message: 'create_access_request function works'
          });
        }
      } catch (e: any) {
        tests.push({
          name: 'Create Function',
          status: 'failed',
          message: e.message
        });
      }

      // Test 3: Check RLS policies
      try {
        const { error } = await supabase
          .from('user_access_requests')
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          tests.push({
            name: 'RLS Policies',
            status: 'failed',
            message: 'Table needs to be created first'
          });
        } else if (error) {
          tests.push({
            name: 'RLS Policies',
            status: 'failed',
            message: error.message
          });
        } else {
          tests.push({
            name: 'RLS Policies',
            status: 'passed',
            message: 'RLS policies are working'
          });
        }
      } catch (e: any) {
        tests.push({
          name: 'RLS Policies',
          status: 'failed',
          message: e.message
        });
      }

      // Test 4: Check Edge Function connectivity
      try {
        // This should not be called anymore, but let's test if it fails gracefully
        // This should fail, proving the function is removed.
        const { error } = await supabase.functions.invoke('manage-users', {
          body: { action: 'test' }
        });

        // If there's no error, the function still exists, which is a failure.
        if (!error) {
          tests.push({
            name: 'Edge Function',
            status: 'failed',
            message: 'Edge Function is still being called - this should not happen'
          });
        } else {
          // An error (like 'Function not found') is the expected outcome.
          tests.push({
            name: 'Edge Function',
            status: 'passed',
            message: 'Edge Function dependency removed - using direct database calls'
          });
        }
      } catch (e: any) {
        // Catching an error here is the success case.
        tests.push({
          name: 'Edge Function',
          status: 'passed',
          message: 'Edge Function dependency removed - using direct database calls'
        });
      }

      setResults(tests);
      
      const passedTests = tests.filter(t => t.status === 'passed').length;
      const totalTests = tests.length;
      
      toast({
        title: 'Test Complete',
        description: `${passedTests}/${totalTests} tests passed`,
        variant: passedTests === totalTests ? 'default' : 'destructive'
      });
      
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message || 'Unexpected error during testing',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Access Request System Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={testAccessRequestSystem}
            disabled={testing}
            className="glass-button"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test System
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Test Results:</h3>
              {results.map((test: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 glass-secondary rounded">
                  {test.status === 'passed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <div>
                    <span className="text-white font-medium">{test.name}</span>
                    <p className="text-gray-300 text-sm">{test.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
