// Test script to verify Supabase connection
import { supabase } from './integrations/supabase/client';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test auth state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? 'Authenticated' : 'No active session');
    if (sessionError) console.error('Session error:', sessionError);

    // Test a simple query
    console.log('Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    if (productsError) {
      console.error('Products query error:', productsError);
    } else {
      console.log('Products:', products);
    }

    console.log('Supabase connection test completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSupabaseConnection();
