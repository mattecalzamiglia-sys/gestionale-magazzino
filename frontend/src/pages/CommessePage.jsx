import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commesseAPI } from '../services/api';

const CommessePage = () => {
  const [commesse, setCommesse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statoFilter, setStatoFilter] = useState('');

  useEffect(() => {
    fetchCommesse();
  }, [statoFilter]);

  const fetchCommesse = async () => {
    try {
      setLoading(true);
      const params = statoFilter ? { stato: statoFilter } : {};
      const response = await commesseAPI.getAll(params);
      setCommesse(response.data);
    } catch (error) {
      console.error('Errore nel caricamento delle commesse:', error);
      alert('Errore nel caricamento delle commesse');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa commessa?')) return;
    
    try {
      await commesseAPI.delete(id);
      fetchCommesse();
      alert('Commessa eliminata con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      alert('Errore nell\'eliminazione della commessa');
    }
  };

  const getStatoBadge = (stato) => {
    const badges = {
      aperta: 'badge-info',
      in_lavorazione: 'badge-warning',
      sospesa: 'badge-danger',
      chiusa: 'badge-success'
    };
    return badges[stato] || 'badge-info';
  };

  const getStatoLabel = (stato) => {
    const labels = {
      aperta: 'Aperta',
      in_lavorazione: 'In Lavorazione',
      sospesa: 'Sospesa',
      chiusa: 'Chiusa'
    };
    return labels[stato] || stato;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commesse</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestione completa delle commesse e tracking costi
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/commesse/nuova" className="btn-primary">
            + Nuova Commessa
          </Link>
        </div>
      </div>

      {/* Filtri */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtra per Stato
            </label>
            <select
              className="input-field"
              value={statoFilter}
              onChange={(e) => setStatoFilter(e.target.value)}
            >
              <option value="">Tutti</option>
              <option value="aperta">Aperta</option>
              <option value="in_lavorazione">In Lavorazione</option>
              <option value="sospesa">Sospesa</option>
              <option value="chiusa">Chiusa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Caricamento...</p>
          </div>
        ) : commesse.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessuna commessa trovata</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrizione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Apertura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preventivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margine
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commesse.map((commessa) => {
                  const margine = parseFloat(commessa.margine || 0);
                  const marginePerc = parseFloat(commessa.margine_percentuale || 0);
                  
                  return (
                    <tr key={commessa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {commessa.codice}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {commessa.descrizione}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {commessa.cliente || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatoBadge(commessa.stato)}>
                          {getStatoLabel(commessa.stato)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(commessa.data_apertura).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{parseFloat(commessa.importo_preventivo || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{parseFloat(commessa.costo_totale || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={margine >= 0 ? 'text-green-600' : 'text-red-600'}>
                          €{margine.toFixed(2)}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({marginePerc.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/commesse/${commessa.id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Dettagli
                        </Link>
                        <button
                          onClick={() => handleDelete(commessa.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommessePage;
