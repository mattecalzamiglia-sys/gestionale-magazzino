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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commessaRes, ricambiRes, dipendentiRes] = await Promise.all([
        commesseAPI.getById(id),
        ricambiAPI.getAll(),
        dipendentiAPI.getAll({ attivo: true })
      ]);
      setCommessa(commessaRes.data);
      setRicambi(ricambiRes.data);
      setDipendenti(dipendentiRes.data);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleScaricoRicambio = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.scaricoRicambio({
        commessa_id: id,
        ...scaricoForm
      });
      alert('Ricambio scaricato con successo');
      setShowScaricoModal(false);
      setScaricoForm({ ricambio_id: '', quantita: 1, operatore: '', note: '' });
      fetchData();
    } catch (error) {
      console.error('Errore nello scarico:', error);
      alert(error.response?.data?.error || 'Errore nello scarico del ricambio');
    }
  };

  const handleRegistraOre = async (e) => {
    e.preventDefault();
    try {
      await commesseAPI.registraOre({
        commessa_id: id,
        ...oreForm
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
      console.error('Errore nella registrazione:', error);
      alert('Errore nella registrazione delle ore');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!commessa) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Commessa non trovata</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/commesse" className="text-primary-600 hover:text-primary-900 mb-4 inline-block">
          ← Torna alle commesse
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commessa.codice}</h1>
            <p className="mt-2 text-sm text-gray-700">{commessa.descrizione}</p>
          </div>
          <Link to={`/commesse/${id}/modifica`} className="btn-primary">
            Modifica
          </Link>
        </div>
      </div>

      {/* Info commessa */}
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

      {/* Riepilogo Costi */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Riepilogo Costi e Margine</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Preventivo</p>
            <p className="text-lg font-semibold text-gray-900">
              €{parseFloat(commessa.importo_preventivo || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Costi Ricambi</p>
            <p className="text-lg font-semibold text-gray-900">
              €{parseFloat(commessa.riepilogo?.totale_ricambi || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Costi Manodopera</p>
            <p className="text-lg font-semibold text-gray-900">
              €{parseFloat(commessa.riepilogo?.totale_ore || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Totale Costi</p>
            <p className="text-lg font-semibold text-red-600">
              €{parseFloat(commessa.riepilogo?.costo_totale || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Margine</p>
            <p className={`text-lg font-semibold ${
              parseFloat(commessa.riepilogo?.margine || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              €{parseFloat(commessa.riepilogo?.margine || 0).toFixed(2)}
              <span className="text-sm ml-1">
                ({commessa.riepilogo?.margine_percentuale || 0}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Ricambi Scaricati */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ricambi Scaricati</h2>
          <button onClick={() => setShowScaricoModal(true)} className="btn-primary">
            Scarica Ricambio
          </button>
        </div>
        {commessa.ricambi?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessun ricambio scaricato</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrizione</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prezzo Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ricambi?.map((mov) => (
                  <tr key={mov.id}>
                    <td className="px-4 py-3 text-sm">{mov.codice}</td>
                    <td className="px-4 py-3 text-sm">{mov.descrizione}</td>
                    <td className="px-4 py-3 text-sm">{mov.quantita}</td>
                    <td className="px-4 py-3 text-sm">€{parseFloat(mov.prezzo_unitario).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">€{parseFloat(mov.costo_totale).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{new Date(mov.data_movimento).toLocaleDateString('it-IT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ore Lavoro */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ore Lavoro</h2>
          <button onClick={() => setShowOreModal(true)} className="btn-primary">
            Registra Ore
          </button>
        </div>
        {commessa.ore_lavoro?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessuna ora registrata</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dipendente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore Ord.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore Straord.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Totale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attività</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commessa.ore_lavoro?.map((ore) => (
                  <tr key={ore.id}>
                    <td className="px-4 py-3 text-sm">{ore.nome} {ore.cognome}</td>
                    <td className="px-4 py-3 text-sm">{new Date(ore.data).toLocaleDateString('it-IT')}</td>
                    <td className="px-4 py-3 text-sm">{ore.ore_ordinarie}h</td>
                    <td className="px-4 py-3 text-sm">{ore.ore_straordinarie}h</td>
                    <td className="px-4 py-3 text-sm font-semibold">€{parseFloat(ore.costo_totale).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{ore.descrizione_attivita || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Scarico Ricambio */}
      {showScaricoModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Scarica Ricambio</h3>
            <form onSubmit={handleScaricoRicambio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ricambio</label>
                <select
                  className="input-field"
                  value={scaricoForm.ricambio_id}
                  onChange={(e) => setScaricoForm({...scaricoForm, ricambio_id: e.target.value})}
                  required
                >
                  <option value="">Seleziona ricambio</option>
                  {ricambi.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.codice} - {r.descrizione} (Disp: {r.quantita})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantità</label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={scaricoForm.quantita}
                  onChange={(e) => setScaricoForm({...scaricoForm, quantita: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Operatore</label>
                <input
                  type="text"
                  className="input-field"
                  value={scaricoForm.operatore}
                  onChange={(e) => setScaricoForm({...scaricoForm, operatore: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={scaricoForm.note}
                  onChange={(e) => setScaricoForm({...scaricoForm, note: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowScaricoModal(false)} className="btn-secondary">
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Scarica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registra Ore */}
      {showOreModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Registra Ore Lavoro</h3>
            <form onSubmit={handleRegistraOre}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dipendente</label>
                <select
                  className="input-field"
                  value={oreForm.dipendente_id}
                  onChange={(e) => setOreForm({...oreForm, dipendente_id: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  className="input-field"
                  value={oreForm.data}
                  onChange={(e) => setOreForm({...oreForm, data: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ore Ordinarie</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={oreForm.ore_ordinarie}
                    onChange={(e) => setOreForm({...oreForm, ore_ordinarie: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ore Straord.</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={oreForm.ore_straordinarie}
                    onChange={(e) => setOreForm({...oreForm, ore_straordinarie: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Attività</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={oreForm.descrizione_attivita}
                  onChange={(e) => setOreForm({...oreForm, descrizione_attivita: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowOreModal(false)} className="btn-secondary">
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Registra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommessaDetailPage;
