import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key starts with:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Attempting to fetch data from database...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Exception occurred:', err);
  }
}

testConnection();
