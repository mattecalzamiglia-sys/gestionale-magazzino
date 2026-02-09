const { Pool } = require('pg');
require('dotenv').config();

// IMPORTANTE: Forza IPv4 PRIMA di creare il pool
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Configurazione per PostgreSQL (Neon/Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connessione
pool.on('connect', () => {
  console.log('✅ Connessione al database PostgreSQL stabilita');
});

pool.on('error', (err) => {
  console.error('❌ Errore imprevisto del database:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
