// Simple Supabase connection test
import { createClient } from '@supabase/supabase-js';

// Get environment variables from the command line or use defaults
const supabaseUrl = process.argv[2] || 'https://ytqruetuadthefyclmiq.supabase.co';
const supabaseKey = process.argv[3] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0cXJ1ZXR1YWR0aGVmeWNsbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTg5OTIsImV4cCI6MjA2ODAzNDk5Mn0.aQ0KUyHmrm_mcZkMDT2QiOGH6dPfhH4tjbPZcH40IDI';

console.log('Testing Supabase connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      console.error('Error accessing products table:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📋 Found ${data?.length || 0} products`);
    
    if (data && data.length > 0) {
      console.log('\nSample product:', {
        id: data[0].id,
        name: data[0].name,
        price: data[0].price,
        category: data[0].category
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
