import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RicambioFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    codice: '',
    descrizione: '',
    quantita: '0',
    prezzo_unitario: '0',
    ubicazione: '',
    fornitore_id: '',
    scorta_minima: '',
    note: ''
  });

  const [fornitori, setFornitori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFornitori();
    if (isEdit) {
      fetchRicambio();
    }
  }, [id]);

  const fetchFornitori = async () => {
    try {
      const response = await api.get('/anagrafiche/fornitori');
      setFornitori(response.data || []);
    } catch (err) {
      console.error('Errore nel caricamento fornitori:', err);
      setFornitori([]);
    }
  };

  const fetchRicambio = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ricambi/${id}`);
      const data = response.data;
      // Converti i numeri in stringhe per i campi input
      setFormData({
        ...data,
        quantita: String(data.quantita || 0),
        prezzo_unitario: String(data.prezzo_unitario || 0),
        scorta_minima: String(data.scorta_minima || ''),
        fornitore_id: String(data.fornitore_id || '')
      });
    } catch (err) {
      setError('Errore nel caricamento del ricambio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await api.put(`/ricambi/${id}`, formData);
      } else {
        await api.post('/ricambi', formData);
      }
      navigate('/magazzino');
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEdit ? 'Modifica Ricambio' : 'Nuovo Ricambio'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codice *
              </label>
              <input
                type="text"
                name="codice"
                value={formData.codice}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione *
              </label>
              <input
                type="text"
                name="descrizione"
                value={formData.descrizione}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantità *
                </label>
                <input
                  type="number"
                  name="quantita"
                  value={formData.quantita}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prezzo Unitario (€) *
                </label>
                <input
                  type="number"
                  name="prezzo_unitario"
                  value={formData.prezzo_unitario}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicazione
              </label>
              <input
                type="text"
                name="ubicazione"
                value={formData.ubicazione}
                onChange={handleChange}
                placeholder="Es: Scaffale A - Ripiano 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornitore
              </label>
              <select
                name="fornitore_id"
                value={formData.fornitore_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona fornitore...</option>
                {fornitori.map(fornitore => (
                  <option key={fornitore.id} value={fornitore.id}>
                    {fornitore.nome}
                  </option>
                ))}
              </select>
              {fornitori.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  ℹ️ Nessun fornitore disponibile. Puoi crearlo più tardi dalla sezione Anagrafiche.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Ricambio')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/magazzino')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RicambioFormPage;
