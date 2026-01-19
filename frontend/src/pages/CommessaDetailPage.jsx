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

  // Form scarico ricambi
  const [scaricoForm, setScaricoForm] = useState({
    ricambio_id: '',
    quantita: 1,
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
    fase_lavorazione: ''
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
        operatore: scaricoForm.operatore,
        note: scaricoForm.note
      });
      alert('Ricambio scaricato con successo');
      setShowScaricoModal(false);
      setScaricoForm({ ricambio_id: '', quantita: 1, operatore: '', note: '' });
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
        fase_lavorazione: oreForm.fase_lavorazione
      });
      alert('Ore registrate con successo');
      setShowOreModal(false);
      setOreForm({
        dipendente_id: '',
        data: new Date().toISOString().split('T')[0],
        ore_ordinarie: 0,
        ore_straordinarie: 0,
        descrizione_attivita: '',
        fase_lavorazione: ''
      });
      fetchData();
    } catch (error) {
      alert('Errore nella registrazione delle ore');
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

      {/* Sezione Riepilogo Costi */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Riepilogo Costi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Preventivo</p>
            <p className="text-lg font-semibold">€{parseFloat(commessa.importo_preventivo || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Totale Costi</p>
            <p className="text-lg font-semibold text-red-600">€{parseFloat(commessa.riepilogo?.costo_totale || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Margine €</p>
            <p className={`text-lg font-semibold ${parseFloat(commessa.riepilogo?.margine || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{parseFloat(commessa.riepilogo?.margine || 0).toFixed(2)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ricambio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prezzo Unit.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operatore</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ricambi.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm">{r.codice} - {r.descrizione}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{r.quantita}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">€{parseFloat(r.prezzo_unitario || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">€{parseFloat(r.costo_totale || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(r.data_movimento).toLocaleDateString('it-IT')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{r.operatore || '-'}</td>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dipendente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore Ord.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore Straord.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Tot.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attività</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ore_lavoro.map((o, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{o.nome} {o.cognome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(o.data).toLocaleDateString('it-IT')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{o.ore_ordinarie}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{o.ore_straordinarie}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">€{parseFloat(o.costo_totale || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{o.fase_lavorazione || '-'}</td>
                    <td className="px-6 py-4 text-sm">{o.descrizione_attivita || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommessaDetailPage;
