const db = require('../config/database');

// GET tutti i ricambi con filtri
exports.getAllRicambi = async (req, res) => {
  try {
    const { search, sotto_scorta } = req.query;
    
    let query = `
      SELECT r.*, f.nome as fornitore_nome
      FROM ricambi r
      LEFT JOIN fornitori f ON r.fornitore_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (r.codice ILIKE $${paramIndex} OR r.descrizione ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (sotto_scorta === 'true') {
      query += ` AND r.quantita <= r.quantita_minima`;
    }

    query += ' ORDER BY r.codice';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dei ricambi:', error);
    res.status(500).json({ error: 'Errore nel recupero dei ricambi' });
  }
};

// GET singolo ricambio
exports.getRicambioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT r.*, f.nome as fornitore_nome
       FROM ricambi r
       LEFT JOIN fornitori f ON r.fornitore_id = f.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ricambio non trovato' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nel recupero del ricambio:', error);
    res.status(500).json({ error: 'Errore nel recupero del ricambio' });
  }
};

// POST nuovo ricambio
exports.createRicambio = async (req, res) => {
  try {
    const {
      codice,
      descrizione,
      quantita,
      quantita_minima,
      prezzo_acquisto,
      prezzo_vendita,
      fornitore_id,
      ubicazione,
      note
    } = req.body;

    const result = await db.query(
      `INSERT INTO ricambi 
       (codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [codice, descrizione, quantita || 0, quantita_minima || 0, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella creazione del ricambio:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Codice ricambio già esistente' });
    } else {
      res.status(500).json({ error: 'Errore nella creazione del ricambio' });
    }
  }
};

// PUT aggiorna ricambio
exports.updateRicambio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codice,
      descrizione,
      quantita,
      quantita_minima,
      prezzo_acquisto,
      prezzo_vendita,
      fornitore_id,
      ubicazione,
      note
    } = req.body;

    const result = await db.query(
      `UPDATE ricambi 
       SET codice = $1, descrizione = $2, quantita = $3, quantita_minima = $4,
           prezzo_acquisto = $5, prezzo_vendita = $6, fornitore_id = $7, 
           ubicazione = $8, note = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ricambio non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del ricambio:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del ricambio' });
  }
};

// DELETE ricambio
exports.deleteRicambio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM ricambi WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ricambio non trovato' });
    }
    
    res.json({ message: 'Ricambio eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del ricambio:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del ricambio' });
  }
};

// GET storico movimenti di un ricambio
exports.getStoricoMovimenti = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT smm.*, c.codice as commessa_codice, c.descrizione as commessa_descrizione
       FROM storico_movimenti_magazzino smm
       LEFT JOIN commesse c ON smm.riferimento_commessa_id = c.id
       WHERE smm.ricambio_id = $1
       ORDER BY smm.data_movimento DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dello storico:', error);
    res.status(500).json({ error: 'Errore nel recupero dello storico' });
  }
};

// POST carico manuale magazzino
exports.caricoMagazzino = async (req, res) => {
  try {
    const { ricambio_id, quantita, causale, operatore } = req.body;

    // Recupera quantità attuale
    const ricambioResult = await db.query('SELECT quantita FROM ricambi WHERE id = $1', [ricambio_id]);
    
    if (ricambioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ricambio non trovato' });
    }

    const quantitaPrecedente = ricambioResult.rows[0].quantita;
    const quantitaNuova = quantitaPrecedente + quantita;

    // Aggiorna quantità
    await db.query('UPDATE ricambi SET quantita = $1 WHERE id = $2', [quantitaNuova, ricambio_id]);

    // Registra movimento
    await db.query(
      `INSERT INTO storico_movimenti_magazzino 
       (ricambio_id, tipo_movimento, quantita, quantita_precedente, quantita_nuova, causale, operatore)
       VALUES ($1, 'carico', $2, $3, $4, $5, $6)`,
      [ricambio_id, quantita, quantitaPrecedente, quantitaNuova, causale, operatore]
    );

    res.json({ 
      message: 'Carico effettuato con successo',
      quantita_precedente: quantitaPrecedente,
      quantita_nuova: quantitaNuova
    });
  } catch (error) {
    console.error('Errore nel carico magazzino:', error);
    res.status(500).json({ error: 'Errore nel carico magazzino' });
  }
};
