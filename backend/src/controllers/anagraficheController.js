const db = require('../config/database');

// ============ DIPENDENTI ============

exports.getAllDipendenti = async (req, res) => {
  try {
    const { attivo } = req.query;
    let query = 'SELECT * FROM dipendenti WHERE 1=1';
    const params = [];

    if (attivo !== undefined) {
      query += ' AND attivo = $1';
      params.push(attivo === 'true');
    }

    query += ' ORDER BY cognome, nome';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dei dipendenti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei dipendenti' });
  }
};

exports.getDipendenteById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM dipendenti WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nel recupero del dipendente:', error);
    res.status(500).json({ error: 'Errore nel recupero del dipendente' });
  }
};

exports.createDipendente = async (req, res) => {
  try {
    const { nome, cognome, codice, email, telefono, qualifica, costo_orario, tariffa_cliente, ruolo, attivo, data_assunzione, note } = req.body;

    // Converte stringhe vuote in null per campi numerici e date
    const cleanCostoOrario = costo_orario === '' ? null : costo_orario;
    const cleanTariffaCliente = tariffa_cliente === '' ? null : tariffa_cliente;
    const cleanDataAssunzione = data_assunzione === '' ? null : data_assunzione;

    const result = await db.query(
      `INSERT INTO dipendenti (nome, cognome, codice, email, telefono, qualifica, costo_orario, tariffa_cliente, ruolo, attivo, data_assunzione, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [nome, cognome, codice || null, email || null, telefono || null, qualifica || null, cleanCostoOrario, cleanTariffaCliente, ruolo || null, attivo !== false, cleanDataAssunzione, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella creazione del dipendente:', error);
    res.status(500).json({ error: 'Errore nella creazione del dipendente' });
  }
};

exports.updateDipendente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cognome, codice, email, telefono, qualifica, costo_orario, tariffa_cliente, ruolo, attivo, data_assunzione, note } = req.body;

    // Converte stringhe vuote in null per campi numerici e date
    const cleanCostoOrario = costo_orario === '' ? null : costo_orario;
    const cleanTariffaCliente = tariffa_cliente === '' ? null : tariffa_cliente;
    const cleanDataAssunzione = data_assunzione === '' ? null : data_assunzione;

    const result = await db.query(
      `UPDATE dipendenti
       SET nome = $1, cognome = $2, codice = $3, email = $4, telefono = $5, qualifica = $6,
           costo_orario = $7, tariffa_cliente = $8, ruolo = $9, attivo = $10, data_assunzione = $11, note = $12
       WHERE id = $13
       RETURNING *`,
      [nome, cognome, codice || null, email || null, telefono || null, qualifica || null, cleanCostoOrario, cleanTariffaCliente, ruolo || null, attivo, cleanDataAssunzione, note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del dipendente:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del dipendente' });
  }
};

exports.deleteDipendente = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM dipendenti WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }
    
    res.json({ message: 'Dipendente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del dipendente:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del dipendente' });
  }
};

// ============ CLIENTI ============

exports.getAllClienti = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clienti ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dei clienti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei clienti' });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM clienti WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nel recupero del cliente:', error);
    res.status(500).json({ error: 'Errore nel recupero del cliente' });
  }
};

exports.createCliente = async (req, res) => {
  try {
    const { nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note } = req.body;

    const result = await db.query(
      `INSERT INTO clienti (nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nome, email || null, telefono || null, indirizzo || null, citta || null, cap || null, partita_iva || null, codice_fiscale || null, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    res.status(500).json({ error: 'Errore nella creazione del cliente' });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note } = req.body;

    const result = await db.query(
      `UPDATE clienti
       SET nome = $1, email = $2, telefono = $3, indirizzo = $4, citta = $5,
           cap = $6, partita_iva = $7, codice_fiscale = $8, note = $9
       WHERE id = $10
       RETURNING *`,
      [nome, email || null, telefono || null, indirizzo || null, citta || null, cap || null, partita_iva || null, codice_fiscale || null, note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del cliente:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del cliente' });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM clienti WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    
    res.json({ message: 'Cliente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del cliente:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del cliente' });
  }
};

// ============ FORNITORI ============

exports.getAllFornitori = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM fornitori ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dei fornitori:', error);
    res.status(500).json({ error: 'Errore nel recupero dei fornitori' });
  }
};

exports.getFornitoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM fornitori WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornitore non trovato' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nel recupero del fornitore:', error);
    res.status(500).json({ error: 'Errore nel recupero del fornitore' });
  }
};

exports.createFornitore = async (req, res) => {
  try {
    const { nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note } = req.body;

    const result = await db.query(
      `INSERT INTO fornitori (nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nome, email || null, telefono || null, indirizzo || null, citta || null, cap || null, partita_iva || null, codice_fiscale || null, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella creazione del fornitore:', error);
    res.status(500).json({ error: 'Errore nella creazione del fornitore' });
  }
};

exports.updateFornitore = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefono, indirizzo, citta, cap, partita_iva, codice_fiscale, note } = req.body;

    const result = await db.query(
      `UPDATE fornitori
       SET nome = $1, email = $2, telefono = $3, indirizzo = $4, citta = $5,
           cap = $6, partita_iva = $7, codice_fiscale = $8, note = $9
       WHERE id = $10
       RETURNING *`,
      [nome, email || null, telefono || null, indirizzo || null, citta || null, cap || null, partita_iva || null, codice_fiscale || null, note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornitore non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del fornitore:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del fornitore' });
  }
};

exports.deleteFornitore = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM fornitori WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornitore non trovato' });
    }
    
    res.json({ message: 'Fornitore eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del fornitore:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del fornitore' });
  }
};

module.exports = exports;
