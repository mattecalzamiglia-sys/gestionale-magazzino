import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ricambiAPI } from '../services/api';

const MagazzinoPage = () => {
  const [ricambi, setRicambi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sottoScorta, setSottoScorta] = useState(false);

  useEffect(() => {
    fetchRicambi();
  }, [search, sottoScorta]);

  const fetchRicambi = async () => {
    try {
      setLoading(true);
      const response = await ricambiAPI.getAll({ search, sotto_scorta: sottoScorta });
      setRicambi(response.data || []); // Protezione se data è null
    } catch (error) {
      console.error('Errore nel caricamento dei ricambi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // PROTEZIONE: Non procedere se l'ID non è valido
    if (!id || isNaN(parseInt(id))) return;
    if (!window.confirm('Sei sicuro di voler eliminare questo ricambio?')) return;
    
    try {
      await ricambiAPI.delete(id);
      fetchRicambi();
      alert('Ricambio eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      alert('Errore nell\'eliminazione del ricambio');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Magazzino Ricambi</h1>
          <p className="mt-2 text-sm text-gray-700">Gestione completa del magazzino ricambi</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/magazzino/nuovo" className="btn-primary">+ Nuovo Ricambio</Link>
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cerca</label>
            <input
              type="text"
              className="input-field"
              placeholder="Codice o descrizione..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                checked={sottoScorta}
                onChange={(e) => setSottoScorta(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Mostra solo sotto scorta</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12"><p className="text-gray-500">Caricamento...</p></div>
        ) : ricambi.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">Nessun ricambio trovato</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ricambi.map((ricambio) => (
                  <tr key={ricambio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ricambio.codice}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={ricambio.quantita <= ricambio.quantita_minima ? 'text-red-600' : 'text-gray-900'}>
                        {ricambio.quantita}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/magazzino/${ricambio.id}`} className="text-primary-600 hover:text-primary-900 mr-4">Dettagli</Link>
                      <button onClick={() => handleDelete(ricambio.id)} className="text-red-600 hover:text-red-900">Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagazzinoPage;
