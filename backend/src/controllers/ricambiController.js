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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });

    const result = await db.query(
      `SELECT r.*, f.nome as fornitore_nome
       FROM ricambi r
       LEFT JOIN fornitori f ON r.fornitore_id = f.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ricambio non trovato' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nel recupero del ricambio:', error);
    res.status(500).json({ error: 'Errore nel recupero del ricambio' });
  }
};

// POST nuovo ricambio
exports.createRicambio = async (req, res) => {
  try {
    const { codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note } = req.body;
    const result = await db.query(
      `INSERT INTO ricambi (codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [codice, descrizione, quantita || 0, quantita_minima || 0, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Codice già esistente' });
    res.status(500).json({ error: 'Errore creazione' });
  }
};

// PUT aggiorna ricambio
exports.updateRicambio = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });

    const { codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note } = req.body;
    const result = await db.query(
      `UPDATE ricambi SET codice = $1, descrizione = $2, quantita = $3, quantita_minima = $4, prezzo_acquisto = $5, prezzo_vendita = $6, fornitore_id = $7, ubicazione = $8, note = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *`,
      [codice, descrizione, quantita, quantita_minima, prezzo_acquisto, prezzo_vendita, fornitore_id, ubicazione, note, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Non trovato' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore aggiornamento' });
  }
};

// DELETE ricambio
exports.deleteRicambio = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });
    const result = await db.query('DELETE FROM ricambi WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Non trovato' });
    res.json({ message: 'Eliminato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore eliminazione' });
  }
};

// GET storico
exports.getStoricoMovimenti = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });
    const result = await db.query(
      `SELECT smm.*, c.codice as commessa_codice FROM storico_movimenti_magazzino smm LEFT JOIN commesse c ON smm.riferimento_commessa_id = c.id WHERE smm.ricambio_id = $1 ORDER BY smm.data_movimento DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore storico' });
  }
};

exports.caricoMagazzino = async (req, res) => {
  try {
    const { ricambio_id, quantita, causale, operatore } = req.body;
    const ricambioResult = await db.query('SELECT quantita FROM ricambi WHERE id = $1', [ricambio_id]);
    if (ricambioResult.rows.length === 0) return res.status(404).json({ error: 'Non trovato' });
    const qPrev = ricambioResult.rows[0].quantita;
    const qNuova = qPrev + quantita;
    await db.query('UPDATE ricambi SET quantita = $1 WHERE id = $2', [qNuova, ricambio_id]);
    await db.query(`INSERT INTO storico_movimenti_magazzino (ricambio_id, tipo_movimento, quantita, quantita_precedente, quantita_nuova, causale, operatore) VALUES ($1, 'carico', $2, $3, $4, $5, $6)`, [ricambio_id, quantita, qPrev, qNuova, causale, operatore]);
    res.json({ message: 'Carico effettuato', quantita_nuova: qNuova });
  } catch (error) {
    res.status(500).json({ error: 'Errore carico' });
  }
};
