// Simple script to test if environment variables are being loaded
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '***' : 'Not Found');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '***' : 'Not Found');

// Try to load .env file directly
require('dotenv').config({ path: '.env.local' });

console.log('\nAfter loading .env.local:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '***' : 'Not Found');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '***' : 'Not Found');
