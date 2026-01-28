-- Migration Script v2 - Aggiunta campi per calcolo preventivo
-- Eseguire questo script se il database esistente necessita di aggiornamento

-- 1. Aggiungere colonne alla tabella movimenti_ricambi_commessa
ALTER TABLE movimenti_ricambi_commessa
ADD COLUMN IF NOT EXISTS prezzo_vendita DECIMAL(10, 2);

-- Nota: le colonne GENERATED non possono essere aggiunte con ALTER TABLE in PostgreSQL
-- Quindi per ricavo_totale bisogna ricreare la tabella oppure usare una view/trigger

-- 2. Aggiungere colonne alla tabella ore_lavoro_commessa
ALTER TABLE ore_lavoro_commessa
ADD COLUMN IF NOT EXISTS tipo_sede VARCHAR(20) DEFAULT 'sede' CHECK (tipo_sede IN ('sede', 'trasferta'));

ALTER TABLE ore_lavoro_commessa
ADD COLUMN IF NOT EXISTS prezzo_km DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE ore_lavoro_commessa
ADD COLUMN IF NOT EXISTS km_percorsi DECIMAL(10, 2) DEFAULT 0;

-- 3. Creare view per ricavo ricambi (alternativa alla colonna GENERATED)
CREATE OR REPLACE VIEW vista_movimenti_ricambi_con_ricavo AS
SELECT
    mrc.*,
    (mrc.quantita * COALESCE(mrc.prezzo_vendita, 0)) as ricavo_totale_calc
FROM movimenti_ricambi_commessa mrc;

-- 4. Creare view per costi ore con trasferta (alternativa alla colonna GENERATED)
CREATE OR REPLACE VIEW vista_ore_lavoro_con_trasferta AS
SELECT
    olc.*,
    ((olc.ore_ordinarie + olc.ore_straordinarie) * olc.costo_orario +
     (COALESCE(olc.km_percorsi, 0) * COALESCE(olc.prezzo_km, 0))) as costo_totale_calc,
    ((olc.ore_ordinarie + olc.ore_straordinarie) * COALESCE(olc.tariffa_cliente, 0) +
     (COALESCE(olc.km_percorsi, 0) * COALESCE(olc.prezzo_km, 0))) as ricavo_totale_calc
FROM ore_lavoro_commessa olc;

-- 5. Aggiornare vista riepilogo commesse
DROP VIEW IF EXISTS vista_riepilogo_commesse;

CREATE OR REPLACE VIEW vista_riepilogo_commesse AS
SELECT
    c.id,
    c.codice,
    c.descrizione,
    c.stato,
    cl.nome as cliente,
    c.data_apertura,
    c.importo_preventivo,
    COALESCE(SUM(DISTINCT mrc.costo_totale), 0) as costo_ricambi,
    COALESCE(SUM(DISTINCT (mrc.quantita * COALESCE(mrc.prezzo_vendita, 0))), 0) as ricavo_ricambi,
    COALESCE(SUM(DISTINCT olc.costo_totale), 0) as costo_manodopera,
    COALESCE(SUM(DISTINCT olc.ricavo_totale), 0) as ricavo_manodopera,
    COALESCE(SUM(DISTINCT cac.importo), 0) as costi_aggiuntivi,
    COALESCE(SUM(DISTINCT mrc.costo_totale), 0) +
    COALESCE(SUM(DISTINCT olc.costo_totale), 0) +
    COALESCE(SUM(DISTINCT cac.importo), 0) as costo_totale,
    COALESCE(SUM(DISTINCT (mrc.quantita * COALESCE(mrc.prezzo_vendita, 0))), 0) +
    COALESCE(SUM(DISTINCT olc.ricavo_totale), 0) as ricavo_totale
FROM commesse c
LEFT JOIN clienti cl ON c.cliente_id = cl.id
LEFT JOIN movimenti_ricambi_commessa mrc ON c.id = mrc.commessa_id
LEFT JOIN ore_lavoro_commessa olc ON c.id = olc.commessa_id
LEFT JOIN costi_aggiuntivi_commessa cac ON c.id = cac.commessa_id
GROUP BY c.id, cl.nome;

-- NOTA IMPORTANTE:
-- Se stai creando il database da zero, usa invece il file schema.sql aggiornato
-- che include le colonne GENERATED ALWAYS AS per i calcoli automatici.
-- Questo script di migrazione e' pensato per database gia' esistenti.
