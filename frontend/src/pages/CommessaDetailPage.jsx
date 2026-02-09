import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { commesseAPI, ricambiAPI, dipendentiAPI } from '../services/api';

const CommessaDetailPage = () => {
  const { id } = useParams();
  const [commessa, setCommessa] = useState(null);
  const [ricambi, setRicambi] = useState([]);
  const [dipendenti, setDipendenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScaricoModal, setShowScaricoModal] = useState(false);
  const [showOreModal, setShowOreModal] = useState(false);
  const [showEditRicambioModal, setShowEditRicambioModal] = useState(false);
  const [showEditOreModal, setShowEditOreModal] = useState(false);
  const [editingRicambio, setEditingRicambio] = useState(null);
  const [editingOre, setEditingOre] = useState(null);

  // Form scarico ricambi
  const [scaricoForm, setScaricoForm] = useState({
    ricambio_id: '',
    quantita: 1,
    prezzo_vendita: '',
    operatore: '',
    note: ''
  });

  // Form ore lavoro
  const [oreForm, setOreForm] = useState({
    dipendente_id: '',
    data: new Date().toISOString().split('T')[0],
    ore_ordinarie: 0,
    ore_straordinarie: 0,
    descrizione_attivita: '',
    fase_lavorazione: '',
    tipo_sede: 'sede',
    prezzo_km: '',
    km_percorsi: '',
    tariffa_cliente: ''
  });

  useEffect(() => {
    // PROTEZIONE: Se l'id non è un numero valido, non fare la chiamata
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const numericId = parseInt(id, 10); // Forza conversione numerica
      
      const [commessaRes, ricambiRes, dipendentiRes] = await Promise.all([
        commesseAPI.getById(numericId),
        ricambiAPI.getAll(),
        dipendentiAPI.getAll({ attivo: true })
      ]);
      setCommessa(commessaRes.data);
      setRicambi(ricambiRes.data);
      setDipendenti(dipendentiRes.data);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      // Non mostrare alert se è un errore di ID non trovato o bad request gestito
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        alert('Errore nel caricamento dei dati');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScaricoRicambio = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.scaricoRicambio({
        commessa_id: parseInt(id),
        ricambio_id: parseInt(scaricoForm.ricambio_id),
        quantita: scaricoForm.quantita,
        prezzo_vendita: scaricoForm.prezzo_vendita ? parseFloat(scaricoForm.prezzo_vendita) : null,
        operatore: scaricoForm.operatore,
        note: scaricoForm.note
      });
      alert('Ricambio scaricato con successo');
      setShowScaricoModal(false);
      setScaricoForm({ ricambio_id: '', quantita: 1, prezzo_vendita: '', operatore: '', note: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Errore nello scarico');
    }
  };

  const handleRegistraOre = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.registraOre({
        commessa_id: parseInt(id),
        dipendente_id: parseInt(oreForm.dipendente_id),
        data: oreForm.data,
        ore_ordinarie: oreForm.ore_ordinarie,
        ore_straordinarie: oreForm.ore_straordinarie,
        descrizione_attivita: oreForm.descrizione_attivita,
        fase_lavorazione: oreForm.fase_lavorazione,
        tipo_sede: oreForm.tipo_sede,
        prezzo_km: oreForm.tipo_sede === 'trasferta' && oreForm.prezzo_km ? parseFloat(oreForm.prezzo_km) : 0,
        km_percorsi: oreForm.tipo_sede === 'trasferta' && oreForm.km_percorsi ? parseFloat(oreForm.km_percorsi) : 0,
        tariffa_cliente: oreForm.tariffa_cliente ? parseFloat(oreForm.tariffa_cliente) : null
      });
      alert('Ore registrate con successo');
      setShowOreModal(false);
      setOreForm({
        dipendente_id: '',
        data: new Date().toISOString().split('T')[0],
        ore_ordinarie: 0,
        ore_straordinarie: 0,
        descrizione_attivita: '',
        fase_lavorazione: '',
        tipo_sede: 'sede',
        prezzo_km: '',
        km_percorsi: '',
        tariffa_cliente: ''
      });
      fetchData();
    } catch (error) {
      alert('Errore nella registrazione delle ore');
    }
  };

  // Funzioni per modifica/elimina ricambi
  const handleEditRicambio = (ricambio) => {
    setEditingRicambio({
      id: ricambio.id,
      quantita: ricambio.quantita,
      prezzo_vendita: ricambio.prezzo_vendita || '',
      operatore: ricambio.operatore || '',
      note: ricambio.note || ''
    });
    setShowEditRicambioModal(true);
  };

  const handleUpdateRicambio = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.updateMovimentoRicambio(editingRicambio.id, {
        quantita: editingRicambio.quantita,
        prezzo_vendita: editingRicambio.prezzo_vendita ? parseFloat(editingRicambio.prezzo_vendita) : null,
        operatore: editingRicambio.operatore,
        note: editingRicambio.note
      });
      alert('Movimento aggiornato con successo');
      setShowEditRicambioModal(false);
      setEditingRicambio(null);
      fetchData();
    } catch (error) {
      alert('Errore nell\'aggiornamento del movimento');
    }
  };

  const handleDeleteRicambio = async (ricambioId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo movimento? La quantità verrà ripristinata nel magazzino.')) return;
    try {
      await commesseAPI.deleteMovimentoRicambio(ricambioId);
      alert('Movimento eliminato e quantità ripristinata');
      fetchData();
    } catch (error) {
      alert('Errore nell\'eliminazione del movimento');
    }
  };

  // Funzioni per modifica/elimina ore
  const handleEditOre = (ore) => {
    setEditingOre({
      id: ore.id,
      data: ore.data.split('T')[0],
      ore_ordinarie: ore.ore_ordinarie || 0,
      ore_straordinarie: ore.ore_straordinarie || 0,
      tariffa_cliente: ore.tariffa_cliente || '',
      descrizione_attivita: ore.descrizione_attivita || '',
      fase_lavorazione: ore.fase_lavorazione || '',
      tipo_sede: ore.tipo_sede || 'sede',
      prezzo_km: ore.prezzo_km || '',
      km_percorsi: ore.km_percorsi || ''
    });
    setShowEditOreModal(true);
  };

  const handleUpdateOre = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.updateOreLavoro(editingOre.id, {
        data: editingOre.data,
        ore_ordinarie: editingOre.ore_ordinarie,
        ore_straordinarie: editingOre.ore_straordinarie,
        tariffa_cliente: editingOre.tariffa_cliente ? parseFloat(editingOre.tariffa_cliente) : null,
        descrizione_attivita: editingOre.descrizione_attivita,
        fase_lavorazione: editingOre.fase_lavorazione,
        tipo_sede: editingOre.tipo_sede,
        prezzo_km: editingOre.tipo_sede === 'trasferta' && editingOre.prezzo_km ? parseFloat(editingOre.prezzo_km) : 0,
        km_percorsi: editingOre.tipo_sede === 'trasferta' && editingOre.km_percorsi ? parseFloat(editingOre.km_percorsi) : 0
      });
      alert('Ore aggiornate con successo');
      setShowEditOreModal(false);
      setEditingOre(null);
      fetchData();
    } catch (error) {
      alert('Errore nell\'aggiornamento delle ore');
    }
  };

  const handleDeleteOre = async (oreId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa registrazione ore?')) return;
    try {
      await commesseAPI.deleteOreLavoro(oreId);
      alert('Registrazione ore eliminata');
      fetchData();
    } catch (error) {
      alert('Errore nell\'eliminazione delle ore');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento...</div>;
  if (!commessa) return <div className="p-8 text-center text-gray-500">Commessa non trovata o ID non valido</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/commesse" className="text-primary-600 hover:text-primary-900 mb-4 inline-block">
          ← Torna alle commesse
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commessa.codice}</h1>
            <p className="mt-2 text-sm text-gray-700">{commessa.descrizione}</p>
          </div>
          <Link to={`/commesse/${id}/modifica`} className="btn-primary">Modifica</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
          <p className="text-xl font-semibold text-gray-900">{commessa.cliente_nome || '-'}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Stato</h3>
          <p className="text-xl font-semibold text-gray-900">{commessa.stato}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Data Apertura</h3>
          <p className="text-xl font-semibold text-gray-900">
            {new Date(commessa.data_apertura).toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>

      {/* Sezione Riepilogo Costi e Ricavi */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Riepilogo Economico</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Costo Ricambi</p>
            <p className="text-lg font-semibold text-red-600">€{parseFloat(commessa.riepilogo?.costo_ricambi || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Ricavo Ricambi</p>
            <p className="text-lg font-semibold text-green-600">€{parseFloat(commessa.riepilogo?.ricavo_ricambi || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Costo Manodopera</p>
            <p className="text-lg font-semibold text-red-600">€{parseFloat(commessa.riepilogo?.costo_ore || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Ricavo Manodopera</p>
            <p className="text-lg font-semibold text-green-600">€{parseFloat(commessa.riepilogo?.ricavo_ore || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Costi Aggiuntivi</p>
            <p className="text-lg font-semibold text-red-600">€{parseFloat(commessa.riepilogo?.totale_costi_aggiuntivi || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Preventivo</p>
            <p className="text-lg font-semibold text-blue-600">€{parseFloat(commessa.importo_preventivo || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="p-3 bg-red-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Totale Costi</p>
            <p className="text-xl font-bold text-red-600">€{parseFloat(commessa.riepilogo?.costo_totale || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Totale Ricavi</p>
            <p className="text-xl font-bold text-green-600">€{parseFloat(commessa.riepilogo?.ricavo_totale || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Margine €</p>
            <p className={`text-xl font-bold ${parseFloat(commessa.riepilogo?.margine || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{parseFloat(commessa.riepilogo?.margine || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <p className="text-xs text-gray-500 uppercase">Margine %</p>
            <p className={`text-xl font-bold ${parseFloat(commessa.riepilogo?.margine_percentuale || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(commessa.riepilogo?.margine_percentuale || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Pulsanti Azione e Modali (logica originale mantenuta) */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setShowScaricoModal(true)} className="btn-primary">Scarica Ricambio</button>
        <button onClick={() => setShowOreModal(true)} className="btn-primary">Registra Ore</button>
      </div>

      {/* Modal Scarico Ricambio */}
      {showScaricoModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scarica Ricambio</h3>
              <button onClick={() => setShowScaricoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleScaricoRicambio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ricambio *</label>
                <select
                  value={scaricoForm.ricambio_id}
                  onChange={(e) => setScaricoForm({...scaricoForm, ricambio_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Seleziona ricambio</option>
                  {ricambi.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.codice} - {r.descrizione} (Disponibili: {r.quantita})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantità *</label>
                <input
                  type="number"
                  min="1"
                  value={scaricoForm.quantita}
                  onChange={(e) => setScaricoForm({...scaricoForm, quantita: parseInt(e.target.value)})}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Vendita (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={scaricoForm.prezzo_vendita}
                  onChange={(e) => setScaricoForm({...scaricoForm, prezzo_vendita: e.target.value})}
                  className="input-field"
                  placeholder={scaricoForm.ricambio_id ? `Default: €${ricambi.find(r => r.id === parseInt(scaricoForm.ricambio_id))?.prezzo_vendita || '0.00'}` : 'Seleziona ricambio'}
                />
                <p className="text-xs text-gray-500 mt-1">Lascia vuoto per usare il prezzo di listino</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <input
                  type="text"
                  value={scaricoForm.operatore}
                  onChange={(e) => setScaricoForm({...scaricoForm, operatore: e.target.value})}
                  className="input-field"
                  placeholder="Nome operatore"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={scaricoForm.note}
                  onChange={(e) => setScaricoForm({...scaricoForm, note: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Note opzionali"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowScaricoModal(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Scarica</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registra Ore */}
      {showOreModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registra Ore Lavoro</h3>
              <button onClick={() => setShowOreModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleRegistraOre}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dipendente *</label>
                <select
                  value={oreForm.dipendente_id}
                  onChange={(e) => setOreForm({...oreForm, dipendente_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Seleziona dipendente</option>
                  {dipendenti.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nome} {d.cognome} - €{d.costo_orario}/h
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={oreForm.data}
                  onChange={(e) => setOreForm({...oreForm, data: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ore Ordinarie</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={oreForm.ore_ordinarie}
                    onChange={(e) => setOreForm({...oreForm, ore_ordinarie: parseFloat(e.target.value) || 0})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ore Straordinarie</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={oreForm.ore_straordinarie}
                    onChange={(e) => setOreForm({...oreForm, ore_straordinarie: parseFloat(e.target.value) || 0})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tariffa Cliente (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={oreForm.tariffa_cliente}
                  onChange={(e) => setOreForm({...oreForm, tariffa_cliente: e.target.value})}
                  className="input-field"
                  placeholder={oreForm.dipendente_id ? `Default: €${dipendenti.find(d => d.id === parseInt(oreForm.dipendente_id))?.tariffa_cliente || '0.00'}/h` : 'Seleziona dipendente'}
                />
                <p className="text-xs text-gray-500 mt-1">Prezzo orario da fatturare al cliente. Lascia vuoto per usare la tariffa standard del dipendente.</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase Lavorazione</label>
                <input
                  type="text"
                  value={oreForm.fase_lavorazione}
                  onChange={(e) => setOreForm({...oreForm, fase_lavorazione: e.target.value})}
                  className="input-field"
                  placeholder="es: Diagnosi, Riparazione, Collaudo"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Luogo Lavoro *</label>
                <select
                  value={oreForm.tipo_sede}
                  onChange={(e) => setOreForm({...oreForm, tipo_sede: e.target.value})}
                  className="input-field"
                >
                  <option value="sede">In Sede</option>
                  <option value="trasferta">In Trasferta</option>
                </select>
              </div>
              {oreForm.tipo_sede === 'trasferta' && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo/Km (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={oreForm.prezzo_km}
                      onChange={(e) => setOreForm({...oreForm, prezzo_km: e.target.value})}
                      className="input-field"
                      placeholder="es: 0.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Km Percorsi</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={oreForm.km_percorsi}
                      onChange={(e) => setOreForm({...oreForm, km_percorsi: e.target.value})}
                      className="input-field"
                      placeholder="es: 120"
                    />
                  </div>
                  {oreForm.prezzo_km && oreForm.km_percorsi && (
                    <div className="col-span-2 text-sm text-blue-700">
                      Costo trasferta: €{(parseFloat(oreForm.prezzo_km) * parseFloat(oreForm.km_percorsi)).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Attività</label>
                <textarea
                  value={oreForm.descrizione_attivita}
                  onChange={(e) => setOreForm({...oreForm, descrizione_attivita: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Descrivi l'attività svolta"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowOreModal(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Registra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabella Ricambi Scaricati */}
      {commessa.ricambi && commessa.ricambi.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ricambi Utilizzati</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ricambio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtà</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Tot.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prezzo Vend.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ricavo Tot.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operatore</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ricambi.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4 text-sm">{r.codice} - {r.descrizione}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{r.quantita}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">€{parseFloat(r.prezzo_unitario || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-red-600">€{parseFloat(r.costo_totale || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">€{parseFloat(r.prezzo_vendita || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">€{parseFloat(r.ricavo_totale || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(r.data_movimento).toLocaleDateString('it-IT')}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{r.operatore || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => handleEditRicambio(r)} className="text-blue-600 hover:text-blue-800 mr-2" title="Modifica">✏️</button>
                      <button onClick={() => handleDeleteRicambio(r.id)} className="text-red-600 hover:text-red-800" title="Elimina">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabella Ore Lavoro */}
      {commessa.ore_lavoro && commessa.ore_lavoro.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ore Lavoro Registrate</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dipendente</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo/h</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tariffa/h</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luogo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trasferta</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Tot.</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ricavo Tot.</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fase</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ore_lavoro.map((o, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{o.nome} {o.cognome}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{new Date(o.data).toLocaleDateString('it-IT')}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {o.ore_ordinarie}h {o.ore_straordinarie > 0 && <span className="text-orange-600">+{o.ore_straordinarie}h str.</span>}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">€{parseFloat(o.costo_orario || 0).toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600">€{parseFloat(o.tariffa_cliente || 0).toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${o.tipo_sede === 'trasferta' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {o.tipo_sede === 'trasferta' ? 'Trasferta' : 'Sede'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {o.tipo_sede === 'trasferta' && o.km_percorsi > 0 ? (
                        <span className="text-blue-600">{o.km_percorsi} km × €{parseFloat(o.prezzo_km || 0).toFixed(2)}</span>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-red-600">€{parseFloat(o.costo_totale || 0).toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-green-600">€{parseFloat(o.ricavo_totale || 0).toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{o.fase_lavorazione || '-'}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => handleEditOre(o)} className="text-blue-600 hover:text-blue-800 mr-2" title="Modifica">✏️</button>
                      <button onClick={() => handleDeleteOre(o.id)} className="text-red-600 hover:text-red-800" title="Elimina">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Modifica Ricambio */}
      {showEditRicambioModal && editingRicambio && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifica Movimento Ricambio</h3>
              <button onClick={() => setShowEditRicambioModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdateRicambio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantità *</label>
                <input
                  type="number"
                  min="1"
                  value={editingRicambio.quantita}
                  onChange={(e) => setEditingRicambio({...editingRicambio, quantita: parseInt(e.target.value)})}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Vendita (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingRicambio.prezzo_vendita}
                  onChange={(e) => setEditingRicambio({...editingRicambio, prezzo_vendita: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <input
                  type="text"
                  value={editingRicambio.operatore}
                  onChange={(e) => setEditingRicambio({...editingRicambio, operatore: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={editingRicambio.note}
                  onChange={(e) => setEditingRicambio({...editingRicambio, note: e.target.value})}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEditRicambioModal(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifica Ore */}
      {showEditOreModal && editingOre && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifica Ore Lavoro</h3>
              <button onClick={() => setShowEditOreModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdateOre}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={editingOre.data}
                  onChange={(e) => setEditingOre({...editingOre, data: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ore Ordinarie</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingOre.ore_ordinarie}
                    onChange={(e) => setEditingOre({...editingOre, ore_ordinarie: parseFloat(e.target.value) || 0})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ore Straordinarie</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingOre.ore_straordinarie}
                    onChange={(e) => setEditingOre({...editingOre, ore_straordinarie: parseFloat(e.target.value) || 0})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tariffa Cliente (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingOre.tariffa_cliente}
                  onChange={(e) => setEditingOre({...editingOre, tariffa_cliente: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase Lavorazione</label>
                <input
                  type="text"
                  value={editingOre.fase_lavorazione}
                  onChange={(e) => setEditingOre({...editingOre, fase_lavorazione: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Luogo Lavoro</label>
                <select
                  value={editingOre.tipo_sede}
                  onChange={(e) => setEditingOre({...editingOre, tipo_sede: e.target.value})}
                  className="input-field"
                >
                  <option value="sede">In Sede</option>
                  <option value="trasferta">In Trasferta</option>
                </select>
              </div>
              {editingOre.tipo_sede === 'trasferta' && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo/Km (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingOre.prezzo_km}
                      onChange={(e) => setEditingOre({...editingOre, prezzo_km: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Km Percorsi</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingOre.km_percorsi}
                      onChange={(e) => setEditingOre({...editingOre, km_percorsi: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Attività</label>
                <textarea
                  value={editingOre.descrizione_attivita}
                  onChange={(e) => setEditingOre({...editingOre, descrizione_attivita: e.target.value})}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEditOreModal(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommessaDetailPage;
