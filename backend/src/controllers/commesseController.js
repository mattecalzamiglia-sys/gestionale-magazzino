const db = require('../config/database');

// GET tutte le commesse
exports.getAllCommesse = async (req, res) => {
  try {
    const { stato, cliente_id } = req.query;
    let query = 'SELECT * FROM vista_riepilogo_commesse WHERE 1=1';
    const params = [];
    let pIdx = 1;
    if (stato) { query += ` AND stato = $${pIdx++}`; params.push(stato); }
    if (cliente_id) { query += ` AND cliente_id = $${pIdx++}`; params.push(cliente_id); }
    query += ' ORDER BY data_apertura DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore recupero commesse' });
  }
};

// GET singola commessa con dettagli completi
exports.getCommessaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });

    const cRes = await db.query(
      `SELECT c.*, cl.nome as cliente_nome, cl.partita_iva, cl.telefono, cl.email
       FROM commesse c
       LEFT JOIN clienti cl ON c.cliente_id = cl.id
       WHERE c.id = $1`, 
      [id]
    );
    
    if (cRes.rows.length === 0) return res.status(404).json({ error: 'Commessa non trovata' });
    const commessa = cRes.rows[0];

    const rRes = await db.query(`SELECT mrc.*, r.codice, r.descrizione FROM movimenti_ricambi_commessa mrc JOIN ricambi r ON mrc.ricambio_id = r.id WHERE mrc.commessa_id = $1`, [id]);
    const oRes = await db.query(`SELECT olc.*, d.nome, d.cognome FROM ore_lavoro_commessa olc JOIN dipendenti d ON olc.dipendente_id = d.id WHERE olc.commessa_id = $1`, [id]);
    const cosRes = await db.query(`SELECT * FROM costi_aggiuntivi_commessa WHERE commessa_id = $1`, [id]);
    const campRes = await db.query(`SELECT * FROM campi_custom_commessa WHERE commessa_id = $1`, [id]);

    const totR = rRes.rows.reduce((s, r) => s + parseFloat(r.costo_totale || 0), 0);
    const totO = oRes.rows.reduce((s, o) => s + parseFloat(o.costo_totale || 0), 0);
    const totC = cosRes.rows.reduce((s, c) => s + parseFloat(c.importo || 0), 0);

    res.json({ 
      ...commessa, 
      ricambi: rRes.rows, 
      ore_lavoro: oRes.rows, 
      costi_aggiuntivi: cosRes.rows, 
      campi_custom: campRes.rows,
      riepilogo: { 
        totale_ricambi: totR,
        totale_ore: totO,
        totale_costi_aggiuntivi: totC,
        costo_totale: totR + totO + totC 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Errore recupero commessa' });
  }
};

// POST nuova commessa
exports.createCommessa = async (req, res) => {
  try {
    const { codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, stato, priorita, importo_preventivo, note } = req.body;
    const result = await db.query(
      `INSERT INTO commesse (codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, stato, priorita, importo_preventivo, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, stato || 'aperta', priorita || 'media', importo_preventivo, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore creazione commessa' });
  }
};

// PUT aggiorna commessa
exports.updateCommessa = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });
    const { codice, cliente_id, descrizione, stato, priorita, note } = req.body;
    const result = await db.query(
      `UPDATE commesse SET codice = $1, cliente_id = $2, descrizione = $3, stato = $4, priorita = $5, note = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
      [codice, cliente_id, descrizione, stato, priorita, note, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Non trovata' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore aggiornamento' });
  }
};

// DELETE commessa
exports.deleteCommessa = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID non valido' });
    await db.query('DELETE FROM commesse WHERE id = $1', [id]);
    res.json({ message: 'Eliminata' });
  } catch (error) {
    res.status(500).json({ error: 'Errore eliminazione' });
  }
};

exports.scaricoRicambio = async (req, res) => {
  try {
    const { commessa_id, ricambio_id, quantita, operatore, note } = req.body;
    const ricResult = await db.query('SELECT quantita, prezzo_acquisto FROM ricambi WHERE id = $1', [ricambio_id]);
    if (ricResult.rows.length === 0) return res.status(404).json({ error: 'Ricambio non trovato' });
    const pUnit = ricResult.rows[0].prezzo_acquisto;
    const result = await db.query(
      `INSERT INTO movimenti_ricambi_commessa (commessa_id, ricambio_id, quantita, prezzo_unitario, operatore, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [commessa_id, ricambio_id, quantita, pUnit, operatore, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Errore scarico' }); }
};

exports.registraOreLavoro = async (req, res) => {
  try {
    const { commessa_id, dipendente_id, data, ore_ordinarie, ore_straordinarie, descrizione_attivita } = req.body;
    const dipRes = await db.query('SELECT costo_orario, tariffa_cliente FROM dipendenti WHERE id = $1', [dipendente_id]);
    if (dipRes.rows.length === 0) return res.status(404).json({ error: 'Dipendente non trovato' });
    const { costo_orario, tariffa_cliente } = dipRes.rows[0];
    const result = await db.query(
      `INSERT INTO ore_lavoro_commessa (commessa_id, dipendente_id, data, ore_ordinarie, ore_straordinarie, costo_orario, tariffa_cliente, descrizione_attivita) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [commessa_id, dipendente_id, data, ore_ordinarie || 0, ore_straordinarie || 0, costo_orario, tariffa_cliente, descrizione_attivita]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Errore ore' }); }
};

exports.aggiungiCostoAggiuntivo = async (req, res) => {
  try {
    const { commessa_id, descrizione, importo, data, tipo } = req.body;
    const result = await db.query(`INSERT INTO costi_aggiuntivi_commessa (commessa_id, descrizione, importo, data, tipo) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [commessa_id, descrizione, importo, data, tipo]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Errore costo' }); }
};
