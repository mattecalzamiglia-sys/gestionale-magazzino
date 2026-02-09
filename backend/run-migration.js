const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2];
const migrationFile = process.argv[3] || 'migration_v3_align_columns.sql';

if (!connectionString) {
  console.error('Usage: node run-migration.js <connection_string> [migration_file]');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const migrationPath = path.join(__dirname, '..', 'database', migrationFile);
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Esecuzione ${migrationFile}...`);
    await client.query(migration);
    console.log('✅ Migrazione completata con successo!');

  } catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
