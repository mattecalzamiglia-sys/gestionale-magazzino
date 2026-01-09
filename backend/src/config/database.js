const { Pool } = require('pg');
require('dotenv').config();

// Configurazione per Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessario per Supabase
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connessione
pool.on('connect', () => {
  console.log('✅ Connessione al database Supabase stabilita');
});

pool.on('error', (err) => {
  console.error('❌ Errore imprevisto del database:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
