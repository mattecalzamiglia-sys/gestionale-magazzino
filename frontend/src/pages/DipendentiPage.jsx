import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DipendentiPage = () => {
  const navigate = useNavigate();
  const [dipendenti, setDipendenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDipendenti();
  }, []);

  const fetchDipendenti = async () => {
    try {
      setLoading(true);
      const response = await api.get('/anagrafiche/dipendenti');
      setDipendenti(response.data || []);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei dipendenti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo dipendente?')) {
      return;
    }

    try {
      await api.delete(`/anagrafiche/dipendenti/${id}`);
      fetchDipendenti();
    } catch (err) {
      alert('Errore nell\'eliminazione del dipendente');
      console.error(err);
    }
  };

  const filteredDipendenti = dipendenti.filter(dipendente =>
    dipendente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dipendente.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dipendente.qualifica?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento dipendenti...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dipendenti</h1>
        <p className="text-gray-600 mt-2">Gestione anagrafica dipendenti</p>
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
              placeholder="Cerca dipendente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate('/anagrafiche/dipendenti/nuovo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            + Nuovo Dipendente
          </button>
        </div>
      </div>

      {filteredDipendenti.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'Nessun dipendente trovato'
              : 'Nessun dipendente presente. Aggiungi il primo dipendente!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/anagrafiche/dipendenti/nuovo')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              + Aggiungi Primo Dipendente
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
                  Qualifica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Costo Orario
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDipendenti.map((dipendente) => (
                <tr key={dipendente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dipendente.nome} {dipendente.cognome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dipendente.qualifica || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dipendente.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dipendente.telefono || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dipendente.costo_orario ? `€${parseFloat(dipendente.costo_orario).toFixed(2)}/h` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/anagrafiche/dipendenti/modifica/${dipendente.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(dipendente.id)}
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
        Totale dipendenti: {filteredDipendenti.length}
      </div>
    </div>
  );
};

export default DipendentiPage;
