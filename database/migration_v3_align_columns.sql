-- Migration Script v3 - Allineamento colonne database con controller
-- Aggiunge i campi mancanti alle tabelle anagrafiche

-- ============ CLIENTI ============
-- Campi esistenti: nome, partita_iva, codice_fiscale, telefono, email, indirizzo
-- Campi da aggiungere: citta, cap, note

ALTER TABLE clienti ADD COLUMN IF NOT EXISTS citta VARCHAR(100);
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS cap VARCHAR(10);
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS note TEXT;

-- ============ FORNITORI ============
-- Campi esistenti: nome, partita_iva, telefono, email, indirizzo
-- Campi da aggiungere: citta, cap, codice_fiscale, note

ALTER TABLE fornitori ADD COLUMN IF NOT EXISTS citta VARCHAR(100);
ALTER TABLE fornitori ADD COLUMN IF NOT EXISTS cap VARCHAR(10);
ALTER TABLE fornitori ADD COLUMN IF NOT EXISTS codice_fiscale VARCHAR(20);
ALTER TABLE fornitori ADD COLUMN IF NOT EXISTS note TEXT;

-- ============ DIPENDENTI ============
-- Campi esistenti: nome, cognome, codice, costo_orario, ruolo, attivo
-- Campi da aggiungere: email, telefono, qualifica, data_assunzione, note
-- NOTA: tariffa_cliente è stata RIMOSSA dai dipendenti (appartiene alla registrazione ore commessa)

ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS qualifica VARCHAR(100);
ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS data_assunzione DATE;
ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS note TEXT;

-- Rimuove tariffa_cliente dai dipendenti (è un attributo della commessa, non del dipendente)
ALTER TABLE dipendenti DROP COLUMN IF EXISTS tariffa_cliente;

-- ============ COMMESSE ============
-- La tabella commesse è già allineata con il controller
-- La tariffa_cliente è già presente in ore_lavoro_commessa (corretto)

-- Verifica: mostra le colonne aggiornate
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clienti';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fornitori';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dipendenti';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'commesse';
