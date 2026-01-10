import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CommessePage = () => {
  const navigate = useNavigate();
  const [commesse, setCommesse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommesse();
  }, []);

  const fetchCommesse = async () => {
    try {
      setLoading(true);
      const response = await api.get('/commesse');
      setCommesse(response.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle commesse');
      console.error('Errore nel caricamento delle commesse:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa commessa?')) {
      return;
    }

    try {
      await api.delete(`/commesse/${id}`);
      fetchCommesse();
    } catch (err) {
      alert('Errore nell\'eliminazione della commessa');
      console.error(err);
    }
  };

  const getStatoBadgeColor = (stato) => {
    const colors = {
      'aperta': 'bg-blue-100 text-blue-800',
      'in_corso': 'bg-yellow-100 text-yellow-800',
      'completata': 'bg-green-100 text-green-800',
      'sospesa': 'bg-orange-100 text-orange-800',
      'annullata': 'bg-red-100 text-red-800'
    };
    return colors[stato] || 'bg-gray-100 text-gray-800';
  };

  const getStatoLabel = (stato) => {
    const labels = {
      'aperta': 'Aperta',
      'in_corso': 'In Corso',
      'completata': 'Completata',
      'sospesa': 'Sospesa',
      'annullata': 'Annullata'
    };
    return labels[stato] || stato;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento commesse...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Commesse</h1>
        <p className="text-gray-600 mt-2">Gestione commesse e ordini di lavoro</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/commesse/nuova')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Nuova Commessa
          </button>
        </div>
      </div>

      {commesse.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            Nessuna commessa presente. Inizia creando la prima commessa!
          </p>
          <button
            onClick={() => navigate('/commesse/nuova')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            + Crea Prima Commessa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commesse.map((commessa) => (
            <div
              key={commessa.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/commesse/${commessa.id}`)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {commessa.codice}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {commessa.descrizione}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatoBadgeColor(commessa.stato)}`}>
                    {getStatoLabel(commessa.stato)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium text-gray-900">
                      {commessa.cliente_nome || 'N/D'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Inizio:</span>
                    <span className="font-medium text-gray-900">
                      {commessa.data_inizio ? new Date(commessa.data_inizio).toLocaleDateString('it-IT') : 'N/D'}
                    </span>
                  </div>
                  {commessa.data_fine_prevista && (
                    <div className="flex justify-between">
                      <span>Fine Prevista:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(commessa.data_fine_prevista).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commesse/modifica/${commessa.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(commessa.id);
                      }}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Totale commesse: {commesse.length}
      </div>
    </div>
  );
};

export default CommessePage;
