const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const ricambiRoutes = require('./routes/ricambi');
const commesseRoutes = require('./routes/commesse');
const anagraficheRoutes = require('./routes/anagrafiche');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS aggiornato - accetta sia localhost che frontend Render
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://gestionale-frontend.onrender.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permetti richieste senza origin (es. Postman, curl)
    if (!origin) return callback(null, true);
    
    // Permetti qualsiasi origin se CORS_ORIGIN è * 
    if (process.env.CORS_ORIGIN === '*') return callback(null, true);
    
    // Controlla se l'origin è nella whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/ricambi', ricambiRoutes);
app.use('/api/commesse', commesseRoutes);
app.use('/api/anagrafiche', anagraficheRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Errore server:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS abilitato per: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
