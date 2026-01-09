const db = require('../config/database');

// GET tutte le commesse con riepilogo costi
exports.getAllCommesse = async (req, res) => {
  try {
    const { stato, cliente_id } = req.query;
    
    let query = 'SELECT * FROM vista_riepilogo_commesse WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (stato) {
      query += ` AND stato = $${paramIndex}`;
      params.push(stato);
      paramIndex++;
    }

    if (cliente_id) {
      query += ` AND cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    query += ' ORDER BY data_apertura DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero delle commesse:', error);
    res.status(500).json({ error: 'Errore nel recupero delle commesse' });
  }
};

// GET singola commessa con dettagli completi
exports.getCommessaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dati commessa base
    const commessaResult = await db.query(
      `SELECT c.*, cl.nome as cliente_nome, cl.partita_iva, cl.telefono, cl.email
       FROM commesse c
       LEFT JOIN clienti cl ON c.cliente_id = cl.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (commessaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Commessa non trovata' });
    }

    const commessa = commessaResult.rows[0];

    // Movimenti ricambi
    const ricambiResult = await db.query(
      `SELECT mrc.*, r.codice, r.descrizione
       FROM movimenti_ricambi_commessa mrc
       JOIN ricambi r ON mrc.ricambio_id = r.id
       WHERE mrc.commessa_id = $1
       ORDER BY mrc.data_movimento DESC`,
      [id]
    );

    // Ore lavoro
    const oreResult = await db.query(
      `SELECT olc.*, d.nome, d.cognome
       FROM ore_lavoro_commessa olc
       JOIN dipendenti d ON olc.dipendente_id = d.id
       WHERE olc.commessa_id = $1
       ORDER BY olc.data DESC`,
      [id]
    );

    // Costi aggiuntivi
    const costiResult = await db.query(
      `SELECT * FROM costi_aggiuntivi_commessa
       WHERE commessa_id = $1
       ORDER BY data DESC`,
      [id]
    );

    // Campi custom
    const campiCustomResult = await db.query(
      `SELECT * FROM campi_custom_commessa
       WHERE commessa_id = $1`,
      [id]
    );

    // Calcola totali
    const totaleRicambi = ricambiResult.rows.reduce((sum, r) => sum + parseFloat(r.costo_totale || 0), 0);
    const totaleOre = oreResult.rows.reduce((sum, o) => sum + parseFloat(o.costo_totale || 0), 0);
    const totaleCostiAggiuntivi = costiResult.rows.reduce((sum, c) => sum + parseFloat(c.importo || 0), 0);
    const costoTotale = totaleRicambi + totaleOre + totaleCostiAggiuntivi;
    const margine = (commessa.importo_preventivo || 0) - costoTotale;
    const marginePercentuale = commessa.importo_preventivo > 0 ? (margine / commessa.importo_preventivo * 100) : 0;

    res.json({
      ...commessa,
      ricambi: ricambiResult.rows,
      ore_lavoro: oreResult.rows,
      costi_aggiuntivi: costiResult.rows,
      campi_custom: campiCustomResult.rows,
      riepilogo: {
        totale_ricambi: totaleRicambi,
        totale_ore: totaleOre,
        totale_costi_aggiuntivi: totaleCostiAggiuntivi,
        costo_totale: costoTotale,
        margine: margine,
        margine_percentuale: marginePercentuale.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Errore nel recupero della commessa:', error);
    res.status(500).json({ error: 'Errore nel recupero della commessa' });
  }
};

// POST nuova commessa
exports.createCommessa = async (req, res) => {
  try {
    const {
      codice,
      cliente_id,
      descrizione,
      data_apertura,
      data_chiusura_prevista,
      stato,
      priorita,
      importo_preventivo,
      note
    } = req.body;

    const result = await db.query(
      `INSERT INTO commesse 
       (codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, stato, priorita, importo_preventivo, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, stato || 'aperta', priorita || 'media', importo_preventivo, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella creazione della commessa:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Codice commessa già esistente' });
    } else {
      res.status(500).json({ error: 'Errore nella creazione della commessa' });
    }
  }
};

// PUT aggiorna commessa
exports.updateCommessa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codice,
      cliente_id,
      descrizione,
      data_apertura,
      data_chiusura_prevista,
      data_chiusura_effettiva,
      stato,
      priorita,
      importo_preventivo,
      note
    } = req.body;

    const result = await db.query(
      `UPDATE commesse 
       SET codice = $1, cliente_id = $2, descrizione = $3, data_apertura = $4,
           data_chiusura_prevista = $5, data_chiusura_effettiva = $6, stato = $7,
           priorita = $8, importo_preventivo = $9, note = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [codice, cliente_id, descrizione, data_apertura, data_chiusura_prevista, data_chiusura_effettiva, stato, priorita, importo_preventivo, note, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commessa non trovata' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento della commessa:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della commessa' });
  }
};

// DELETE commessa
exports.deleteCommessa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM commesse WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commessa non trovata' });
    }
    
    res.json({ message: 'Commessa eliminata con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione della commessa:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della commessa' });
  }
};

// POST scarico ricambio su commessa
exports.scaricoRicambio = async (req, res) => {
  try {
    const { commessa_id, ricambio_id, quantita, operatore, note } = req.body;

    // Verifica disponibilità
    const ricambioResult = await db.query('SELECT quantita, prezzo_acquisto FROM ricambi WHERE id = $1', [ricambio_id]);
    
    if (ricambioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ricambio non trovato' });
    }

    const quantitaDisponibile = ricambioResult.rows[0].quantita;
    const prezzoUnitario = ricambioResult.rows[0].prezzo_acquisto;

    if (quantitaDisponibile < quantita) {
      return res.status(400).json({ 
        error: 'Quantità non disponibile',
        disponibile: quantitaDisponibile,
        richiesta: quantita
      });
    }

    // Inserisci movimento (il trigger aggiornerà automaticamente il magazzino)
    const result = await db.query(
      `INSERT INTO movimenti_ricambi_commessa 
       (commessa_id, ricambio_id, quantita, prezzo_unitario, operatore, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [commessa_id, ricambio_id, quantita, prezzoUnitario, operatore, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nello scarico del ricambio:', error);
    res.status(500).json({ error: 'Errore nello scarico del ricambio' });
  }
};

// POST registrazione ore lavoro
exports.registraOreLavoro = async (req, res) => {
  try {
    const {
      commessa_id,
      dipendente_id,
      data,
      ore_ordinarie,
      ore_straordinarie,
      descrizione_attivita,
      fase_lavorazione
    } = req.body;

    // Recupera costo orario e tariffa del dipendente
    const dipendenteResult = await db.query(
      'SELECT costo_orario, tariffa_cliente FROM dipendenti WHERE id = $1',
      [dipendente_id]
    );

    if (dipendenteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }

    const { costo_orario, tariffa_cliente } = dipendenteResult.rows[0];

    const result = await db.query(
      `INSERT INTO ore_lavoro_commessa 
       (commessa_id, dipendente_id, data, ore_ordinarie, ore_straordinarie, 
        costo_orario, tariffa_cliente, descrizione_attivita, fase_lavorazione)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [commessa_id, dipendente_id, data, ore_ordinarie || 0, ore_straordinarie || 0, 
       costo_orario, tariffa_cliente, descrizione_attivita, fase_lavorazione]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella registrazione delle ore:', error);
    res.status(500).json({ error: 'Errore nella registrazione delle ore' });
  }
};

// POST costo aggiuntivo
exports.aggiungiCostoAggiuntivo = async (req, res) => {
  try {
    const {
      commessa_id,
      descrizione,
      importo,
      data,
      tipo,
      fattura_fornitore,
      note
    } = req.body;

    const result = await db.query(
      `INSERT INTO costi_aggiuntivi_commessa 
       (commessa_id, descrizione, importo, data, tipo, fattura_fornitore, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [commessa_id, descrizione, importo, data, tipo, fattura_fornitore, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiunta del costo:', error);
    res.status(500).json({ error: 'Errore nell\'aggiunta del costo' });
  }
};
