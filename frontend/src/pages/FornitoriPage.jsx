import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const FornitoriPage = () => {
  const navigate = useNavigate();
  const [fornitori, setFornitori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFornitori();
  }, []);

  const fetchFornitori = async () => {
    try {
      setLoading(true);
      const response = await api.get('/anagrafiche/fornitori');
      setFornitori(response.data || []);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei fornitori');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      return;
    }

    try {
      await api.delete(`/anagrafiche/fornitori/${id}`);
      fetchFornitori();
    } catch (err) {
      alert('Errore nell\'eliminazione del fornitore');
      console.error(err);
    }
  };

  const filteredFornitori = fornitori.filter(fornitore =>
    fornitore.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornitore.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornitore.telefono?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento fornitori...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fornitori</h1>
        <p className="text-gray-600 mt-2">Gestione anagrafica fornitori</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca fornitore..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate('/anagrafiche/fornitori/nuovo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            + Nuovo Fornitore
          </button>
        </div>
      </div>

      {filteredFornitori.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'Nessun fornitore trovato'
              : 'Nessun fornitore presente. Aggiungi il primo fornitore!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/anagrafiche/fornitori/nuovo')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              + Aggiungi Primo Fornitore
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Città
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFornitori.map((fornitore) => (
                <tr key={fornitore.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fornitore.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {fornitore.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {fornitore.telefono || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {fornitore.citta || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/anagrafiche/fornitori/modifica/${fornitore.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(fornitore.id)}
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
        Totale fornitori: {filteredFornitori.length}
      </div>
    </div>
  );
};

export default FornitoriPage;
