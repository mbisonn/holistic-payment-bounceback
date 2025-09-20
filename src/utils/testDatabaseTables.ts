import { supabase } from '@/integrations/supabase/client';

export const testDatabaseTables = async () => {
  const tables = [
    'discount_codes',
    'email_templates', 
    'email_campaigns',
    'customer_tags',
    'automation_rules',
    'upsell_products',
    'order_bumps',
    'products',
    'orders',
    'customer_tag_assignments'
  ];

  const results: { [key: string]: boolean } = {};

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('*')
        .limit(1);
      
      results[table] = !error;
      console.log(`Table ${table}: ${!error ? '✅ Accessible' : '❌ Error'}`);
      if (error) {
        console.error(`Error accessing ${table}:`, error);
      }
    } catch (err) {
      results[table] = false;
      console.error(`Exception accessing ${table}:`, err);
    }
  }

  return results;
};

export const checkTablePermissions = async () => {
  const testData = {
    discount_codes: { code: 'TEST123', type: 'percentage', value: 10 },
    email_templates: { name: 'Test Template', subject: 'Test', body: 'Test body' },
    email_campaigns: { name: 'Test Campaign', subject: 'Test' },
    customer_tags: { name: 'Test Tag', color: '#3B82F6' },
    automation_rules: { name: 'Test Rule', trigger: 'test', action: 'test' },
    upsell_products: { name: 'Test Product', price: 100 },
    order_bumps: { title: 'Test Bump', price: 50 },
    products: { name: 'Test Product', price: 100 },
    orders: { customer_name: 'Test', customer_email: 'test@test.com', total_amount: 100 }
  };

  const results: { [key: string]: boolean } = {};

  for (const [tableName, data] of Object.entries(testData)) {
    try {
      // Test insert
      const { error: insertError } = await supabase
        .from(tableName as any)
        .insert([data]);
      
      if (insertError) {
        console.error(`Insert error for ${tableName}:`, insertError);
        results[tableName] = false;
        continue;
      }

      // Test select
      const { error: selectError } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(1);
      
      results[tableName] = !selectError;
      console.log(`Table ${tableName}: ${!selectError ? '✅ Read/Write' : '❌ Error'}`);
      
    } catch (err) {
      results[tableName] = false;
      console.error(`Exception testing ${tableName}:`, err);
    }
  }

  return results;
};
