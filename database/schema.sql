-- Schema Database Gestionale

-- Tabella Fornitori
CREATE TABLE fornitori (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    partita_iva VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(255),
    indirizzo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Ricambi
CREATE TABLE ricambi (
    id SERIAL PRIMARY KEY,
    codice VARCHAR(50) UNIQUE NOT NULL,
    descrizione TEXT NOT NULL,
    quantita INTEGER DEFAULT 0,
    quantita_minima INTEGER DEFAULT 0,
    prezzo_acquisto DECIMAL(10, 2),
    prezzo_vendita DECIMAL(10, 2),
    fornitore_id INTEGER REFERENCES fornitori(id),
    ubicazione VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Clienti
CREATE TABLE clienti (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    partita_iva VARCHAR(20),
    codice_fiscale VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(255),
    indirizzo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Dipendenti
CREATE TABLE dipendenti (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cognome VARCHAR(255) NOT NULL,
    codice VARCHAR(50) UNIQUE,
    costo_orario DECIMAL(10, 2) NOT NULL,
    tariffa_cliente DECIMAL(10, 2),
    ruolo VARCHAR(100),
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Commesse
CREATE TABLE commesse (
    id SERIAL PRIMARY KEY,
    codice VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INTEGER REFERENCES clienti(id),
    descrizione TEXT NOT NULL,
    data_apertura DATE NOT NULL,
    data_chiusura_prevista DATE,
    data_chiusura_effettiva DATE,
    stato VARCHAR(50) DEFAULT 'aperta' CHECK (stato IN ('aperta', 'in_lavorazione', 'sospesa', 'chiusa')),
    priorita VARCHAR(20) DEFAULT 'media' CHECK (priorita IN ('bassa', 'media', 'alta', 'urgente')),
    importo_preventivo DECIMAL(10, 2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Movimenti Ricambi su Commessa
CREATE TABLE movimenti_ricambi_commessa (
    id SERIAL PRIMARY KEY,
    commessa_id INTEGER REFERENCES commesse(id) ON DELETE CASCADE,
    ricambio_id INTEGER REFERENCES ricambi(id),
    quantita INTEGER NOT NULL,
    prezzo_unitario DECIMAL(10, 2) NOT NULL,
    costo_totale DECIMAL(10, 2) GENERATED ALWAYS AS (quantita * prezzo_unitario) STORED,
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operatore VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Ore Lavoro su Commessa
CREATE TABLE ore_lavoro_commessa (
    id SERIAL PRIMARY KEY,
    commessa_id INTEGER REFERENCES commesse(id) ON DELETE CASCADE,
    dipendente_id INTEGER REFERENCES dipendenti(id),
    data DATE NOT NULL,
    ore_ordinarie DECIMAL(5, 2) DEFAULT 0,
    ore_straordinarie DECIMAL(5, 2) DEFAULT 0,
    costo_orario DECIMAL(10, 2) NOT NULL,
    tariffa_cliente DECIMAL(10, 2),
    costo_totale DECIMAL(10, 2) GENERATED ALWAYS AS ((ore_ordinarie + ore_straordinarie) * costo_orario) STORED,
    ricavo_totale DECIMAL(10, 2) GENERATED ALWAYS AS ((ore_ordinarie + ore_straordinarie) * tariffa_cliente) STORED,
    descrizione_attivita TEXT,
    fase_lavorazione VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Costi Aggiuntivi Commessa
CREATE TABLE costi_aggiuntivi_commessa (
    id SERIAL PRIMARY KEY,
    commessa_id INTEGER REFERENCES commesse(id) ON DELETE CASCADE,
    descrizione TEXT NOT NULL,
    importo DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(100),
    fattura_fornitore VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Campi Custom Commessa (per flessibilità)
CREATE TABLE campi_custom_commessa (
    id SERIAL PRIMARY KEY,
    commessa_id INTEGER REFERENCES commesse(id) ON DELETE CASCADE,
    nome_campo VARCHAR(100) NOT NULL,
    valore TEXT,
    tipo_dato VARCHAR(20) DEFAULT 'testo' CHECK (tipo_dato IN ('testo', 'numero', 'data', 'file')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Storico Movimenti Magazzino (per tracciabilità completa)
CREATE TABLE storico_movimenti_magazzino (
    id SERIAL PRIMARY KEY,
    ricambio_id INTEGER REFERENCES ricambi(id),
    tipo_movimento VARCHAR(50) CHECK (tipo_movimento IN ('carico', 'scarico', 'rettifica', 'inventario')),
    quantita INTEGER NOT NULL,
    quantita_precedente INTEGER,
    quantita_nuova INTEGER,
    causale TEXT,
    riferimento_commessa_id INTEGER REFERENCES commesse(id),
    operatore VARCHAR(255),
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_ricambi_codice ON ricambi(codice);
CREATE INDEX idx_commesse_codice ON commesse(codice);
CREATE INDEX idx_commesse_stato ON commesse(stato);
CREATE INDEX idx_movimenti_commessa ON movimenti_ricambi_commessa(commessa_id);
CREATE INDEX idx_ore_commessa ON ore_lavoro_commessa(commessa_id);
CREATE INDEX idx_ore_dipendente ON ore_lavoro_commessa(dipendente_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ricambi_updated_at BEFORE UPDATE ON ricambi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commesse_updated_at BEFORE UPDATE ON commesse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dipendenti_updated_at BEFORE UPDATE ON dipendenti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per aggiornare quantità magazzino quando si scarica su commessa
CREATE OR REPLACE FUNCTION aggiorna_quantita_magazzino()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna la quantità del ricambio
    UPDATE ricambi 
    SET quantita = quantita - NEW.quantita 
    WHERE id = NEW.ricambio_id;
    
    -- Registra nello storico
    INSERT INTO storico_movimenti_magazzino (
        ricambio_id, 
        tipo_movimento, 
        quantita, 
        causale, 
        riferimento_commessa_id,
        operatore
    ) VALUES (
        NEW.ricambio_id,
        'scarico',
        NEW.quantita,
        'Scarico su commessa',
        NEW.commessa_id,
        NEW.operatore
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_scarico_magazzino 
AFTER INSERT ON movimenti_ricambi_commessa 
FOR EACH ROW EXECUTE FUNCTION aggiorna_quantita_magazzino();

-- View per riepilogo costi commessa
CREATE OR REPLACE VIEW vista_riepilogo_commesse AS
SELECT 
    c.id,
    c.codice,
    c.descrizione,
    c.stato,
    cl.nome as cliente,
    c.data_apertura,
    c.importo_preventivo,
    COALESCE(SUM(mrc.costo_totale), 0) as costo_ricambi,
    COALESCE(SUM(olc.costo_totale), 0) as costo_manodopera,
    COALESCE(SUM(cac.importo), 0) as costi_aggiuntivi,
    COALESCE(SUM(mrc.costo_totale), 0) + 
    COALESCE(SUM(olc.costo_totale), 0) + 
    COALESCE(SUM(cac.importo), 0) as costo_totale,
    c.importo_preventivo - (
        COALESCE(SUM(mrc.costo_totale), 0) + 
        COALESCE(SUM(olc.costo_totale), 0) + 
        COALESCE(SUM(cac.importo), 0)
    ) as margine,
    CASE 
        WHEN c.importo_preventivo > 0 THEN
            ((c.importo_preventivo - (
                COALESCE(SUM(mrc.costo_totale), 0) + 
                COALESCE(SUM(olc.costo_totale), 0) + 
                COALESCE(SUM(cac.importo), 0)
            )) / c.importo_preventivo * 100)
        ELSE 0
    END as margine_percentuale
FROM commesse c
LEFT JOIN clienti cl ON c.cliente_id = cl.id
LEFT JOIN movimenti_ricambi_commessa mrc ON c.id = mrc.commessa_id
LEFT JOIN ore_lavoro_commessa olc ON c.id = olc.commessa_id
LEFT JOIN costi_aggiuntivi_commessa cac ON c.id = cac.commessa_id
GROUP BY c.id, cl.nome;
