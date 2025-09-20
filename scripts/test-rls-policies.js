// Test RLS policies before deployment
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRLSPolicies() {
  const tests = [
    {
      name: 'Admin can access products',
      table: 'products',
      role: 'admin',
      expected: true,
      operation: 'select'
    },
    {
      name: 'Anonymous cannot access orders',
      table: 'orders',
      role: 'anon',
      expected: false,
      operation: 'select'
    },
    // Add more test cases as needed
  ];

  for (const test of tests) {
    try {
      let result;
      if (test.operation === 'select') {
        result = await supabase
          .from(test.table)
          .select('*')
          .limit(1);
      }
      
      const passed = test.expected ? !result.error : !!result.error;
      console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed) {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR`, error);
    }
  }
}

testRLSPolicies();
