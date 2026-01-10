import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MagazzinoPage = () => {
  const navigate = useNavigate();
  const [ricambi, setRicambi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sottoScorta, setSottoScorta] = useState(false);

  useEffect(() => {
    fetchRicambi();
  }, []);

  const fetchRicambi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ricambi');
      setRicambi(response.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei ricambi');
      console.error('Errore nel caricamento dei ricambi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo ricambio?')) {
      return;
    }

    try {
      await api.delete(`/ricambi/${id}`);
      fetchRicambi();
    } catch (err) {
      alert('Errore nell\'eliminazione del ricambio');
      console.error(err);
    }
  };

  const filteredRicambi = ricambi.filter(ricambio => {
    const matchesSearch = 
      ricambio.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ricambio.descrizione.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSottoScorta = !sottoScorta || 
      (ricambio.scorta_minima && ricambio.quantita <= ricambio.scorta_minima);
    
    return matchesSearch && matchesSottoScorta;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento ricambi...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Magazzino Ricambi</h1>
        <p className="text-gray-600 mt-2">Gestione completa del magazzino ricambi</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Codice o descrizione..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sottoScorta}
                onChange={(e) => setSottoScorta(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mostra solo sotto scorta
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/magazzino/nuovo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Nuovo Ricambio
          </button>
        </div>
      </div>

      {filteredRicambi.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm || sottoScorta 
              ? 'Nessun ricambio trovato con i filtri selezionati'
              : 'Nessun ricambio presente. Inizia aggiungendo il primo ricambio!'}
          </p>
          {!searchTerm && !sottoScorta && (
            <button
              onClick={() => navigate('/magazzino/nuovo')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              + Aggiungi Primo Ricambio
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Quantità
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prezzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicazione
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRicambi.map((ricambio) => (
                <tr key={ricambio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ricambio.codice}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ricambio.descrizione}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={
                      ricambio.scorta_minima && ricambio.quantita <= ricambio.scorta_minima
                        ? 'text-red-600 font-semibold'
                        : ''
                    }>
                      {ricambio.quantita}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{parseFloat(ricambio.prezzo_unitario).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ricambio.ubicazione || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/magazzino/modifica/${ricambio.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(ricambio.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Totale ricambi: {filteredRicambi.length}
      </div>
    </div>
  );
};

export default MagazzinoPage;
