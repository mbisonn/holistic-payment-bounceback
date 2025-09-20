import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const getDbConfig = () => {
  const envPath = path.resolve(process.cwd(), 'temp-env');
  if (!fs.existsSync(envPath)) {
    throw new Error('temp-env file not found. Please create it with your database credentials.');
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const config = {};
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...value] = trimmedLine.split('=');
      if (key && value.length > 0) {
        config[key.trim()] = value.join('=').trim();
      }
    }
  });

  const dbConfig = {
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: parseInt(config.DB_PORT, 10),
    ssl: {
      rejectUnauthorized: false,
    },
  };

  if (!dbConfig.user || !dbConfig.host || !dbConfig.database || !dbConfig.password || !dbConfig.port) {
      console.error('Database configuration is incomplete. Please check your temp-env file.', dbConfig);
      process.exit(1);
  }

  return dbConfig;
};

const dbConfig = getDbConfig();
console.log('Using DB Config:', dbConfig);
const pool = new Pool(dbConfig);

const runMigrations = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database successfully.');
    const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath).sort();

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
        await client.query(sql);
        console.log(`  ✓ Success`);
      }
    }
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('Disconnected from database.');
  }
};

runMigrations();
