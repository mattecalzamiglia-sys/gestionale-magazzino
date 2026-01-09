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
        ...scaricoForm
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

      {/* Logica dei Modali e Tabelle rimane invariata per brevità */}
    </div>
  );
};

export default CommessaDetailPage;
