import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create test clients with different roles
const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Test data
const testCheckoutData = {
  user_id: 'test-user-id',
  cart_data: { items: [] },
  status: 'abandoned',
  total_amount: 0,
};

describe('RLS Policy Tests', () => {
  beforeAll(async () => {
    // Insert test data
    await adminClient.from('abandoned_checkouts').insert(testCheckoutData);
  });

  afterAll(async () => {
    // Clean up test data
    await adminClient.from('abandoned_checkouts').delete().eq('user_id', 'test-user-id');
  });

  test('Anonymous user cannot access abandoned checkouts', async () => {
    const { data, error } = await anonClient.from('abandoned_checkouts').select('*');
    expect(error).toBeNull();
    expect(data?.length).toBe(0); // Should be empty due to RLS
  });

  test('Admin can access abandoned checkouts', async () => {
    const { data, error } = await adminClient.from('abandoned_checkouts').select('*');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
