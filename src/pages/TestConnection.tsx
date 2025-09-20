import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Testing connection...');
  const [envVars, setEnvVars] = useState({
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
  });

  useEffect(() => {
    // Test connection when component mounts
    const testConnection = async () => {
      try {
        // Check configuration from client
        const env = {
          VITE_SUPABASE_URL: 'https://ytqruetuadthefyclmiq.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'.substring(0, 20) + '...'
        };
        setEnvVars(env);

        // Test Supabase connection
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }

        setConnectionStatus(`✅ Successfully connected to Supabase! Found ${data?.length || 0} products.`);
      } catch (error: unknown) {
        console.error('Connection test failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setConnectionStatus(`❌ Connection failed: ${errorMessage}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Connection Test</h1>
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Environment Variables:</h3>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Connection Status:</h3>
        <pre>{connectionStatus}</pre>
      </div>
    </div>
  );
}
