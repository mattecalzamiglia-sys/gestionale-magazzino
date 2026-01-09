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
      console.error('Errore caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Eliminare questa commessa?')) return;
    try {
      await commesseAPI.delete(id);
      fetchCommesse();
    } catch (error) {
      alert('Errore nell\'eliminazione');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Commesse</h1>
        <Link to="/commesse/nuova" className="btn-primary">+ Nuova</Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Caricamento...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commesse.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.codice}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.stato}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link to={`/commesse/${c.id}`} className="text-primary-600 hover:text-primary-900 mr-4">Dettagli</Link>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CommessePage;
