import { Client } from 'pg';
import { config } from 'dotenv';

// Load .env.local from the current directory (backend-maintenance)
config({ path: '.env.local' });

async function addContentVersionColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in .env.local');
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Postgres');

    const sql = `
      ALTER TABLE user_progress
      ADD COLUMN IF NOT EXISTS content_version text DEFAULT 'v1';
    `;

    await client.query(sql);
    console.log('✅ content_version column added or already exists');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addContentVersionColumn();



