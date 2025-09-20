import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function testRLSPolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  // Test abandoned_checkouts table
  console.log('Testing abandoned_checkouts policies...');
  
  try {
    // Test admin access
    const { data: adminData, error: adminError } = await adminClient
      .from('abandoned_checkouts')
      .select('*')
      .limit(1);
    
    console.log('Admin access test:', adminError ? '❌ Failed' : '✅ Passed');
    if (adminError) console.error('Admin error:', adminError);
    
    // Test anonymous access
    const { data: anonData, error: anonError } = await anonClient
      .from('abandoned_checkouts')
      .select('*')
      .limit(1);
    
    console.log('Anonymous access test:', anonError ? '❌ Failed' : '✅ Passed');
    if (anonError) console.error('Anonymous error:', anonError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRLSPolicies();
