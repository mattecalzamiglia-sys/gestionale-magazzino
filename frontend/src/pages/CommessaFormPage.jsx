import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CommessaFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    codice: '',
    descrizione: '',
    cliente_id: '',
    data_inizio: '',
    data_fine_prevista: '',
    stato: 'aperta',
    note: ''
  });

  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClienti();
    if (isEdit) {
      fetchCommessa();
    }
  }, [id]);

  const fetchClienti = async () => {
    try {
      const response = await api.get('/anagrafiche/clienti');
      setClienti(response.data || []);
    } catch (err) {
      console.error('Errore nel caricamento clienti:', err);
      setClienti([]);
    }
  };

  const fetchCommessa = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/commesse/${id}`);
      // Formatta le date per l'input type="date"
      const data = response.data;
      if (data.data_inizio) {
        data.data_inizio = data.data_inizio.split('T')[0];
      }
      if (data.data_fine_prevista) {
        data.data_fine_prevista = data.data_fine_prevista.split('T')[0];
      }
      setFormData(data);
    } catch (err) {
      setError('Errore nel caricamento della commessa');
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
      // Converti cliente_id in numero se presente, altrimenti null
      const dataToSend = {
        ...formData,
        cliente_id: formData.cliente_id && formData.cliente_id !== '' ? parseInt(formData.cliente_id) : null
      };

      if (isEdit) {
        await api.put(`/commesse/${id}`, dataToSend);
      } else {
        await api.post('/commesse', dataToSend);
      }
      navigate('/commesse');
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
          {isEdit ? 'Modifica Commessa' : 'Nuova Commessa'}
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
                Codice Commessa *
              </label>
              <input
                type="text"
                name="codice"
                value={formData.codice}
                onChange={handleChange}
                required
                placeholder="Es: COM-2026-001"
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
                placeholder="Descrizione breve della commessa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona cliente...</option>
                {clienti.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
              {clienti.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  ℹ️ Nessun cliente disponibile. Puoi crearlo più tardi dalla sezione Anagrafiche.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inizio *
                </label>
                <input
                  type="date"
                  name="data_inizio"
                  value={formData.data_inizio}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fine Prevista
                </label>
                <input
                  type="date"
                  name="data_fine_prevista"
                  value={formData.data_fine_prevista}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato *
              </label>
              <select
                name="stato"
                value={formData.stato}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="aperta">Aperta</option>
                <option value="in_corso">In Corso</option>
                <option value="completata">Completata</option>
                <option value="sospesa">Sospesa</option>
                <option value="annullata">Annullata</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="4"
                placeholder="Note aggiuntive sulla commessa..."
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
              {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Commessa')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/commesse')}
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

export default CommessaFormPage;
