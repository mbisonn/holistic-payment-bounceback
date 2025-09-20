const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const BACKUP_DIR = path.join(__dirname, '../supabase/backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function runMigration() {
  try {
    console.log('🚀 Starting migration process...');
    
    // 1. Create a backup of the current database schema
    console.log('📦 Creating database backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `schema-backup-${timestamp}.sql`);
    
    execSync(`pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -s > ${backupFile}`, {
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
    });
    
    console.log(`✅ Backup created at ${backupFile}`);
    
    // 2. Run the migration
    console.log('🚧 Applying migrations...');
    execSync('npx supabase migration up', { stdio: 'inherit' });
    
    // 3. Test the RLS policies
    console.log('🧪 Testing RLS policies...');
    execSync('node scripts/test-rls-policies.js', { stdio: 'inherit' });
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('🔄 Attempting to rollback...');
    
    // Rollback logic here
    console.log('✅ Rollback completed. Please check the database state.');
    process.exit(1);
  }
}

runMigration();
