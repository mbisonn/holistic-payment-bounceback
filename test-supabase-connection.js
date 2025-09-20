// Test Supabase connection and table access
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '***' + supabaseKey.slice(-5) : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\nTesting Supabase connection...');
    
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth test error:', authError);
    } else {
      console.log('Auth test successful');
    }
    
    // Test products table access
    console.log('\nTesting products table access...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
      
    if (productsError) {
      console.error('Products table error:', productsError);
    } else {
      console.log(`Successfully fetched ${products?.length || 0} products`);
      if (products && products.length > 0) {
        console.log('Sample product:', {
          id: products[0].id,
          name: products[0].name,
          price: products[0].price,
          category: products[0].category
        });
      }
    }
    
    // Check RLS policies
    console.log('\nChecking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { schema_name: 'public', table_name: 'products' });
      
    if (policiesError) {
      console.log('Note: Could not fetch RLS policies (might need admin access)');
    } else {
      console.log('RLS Policies:', policies);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
