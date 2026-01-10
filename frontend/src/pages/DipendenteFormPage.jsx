import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DipendenteFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    qualifica: '',
    costo_orario: '',
    data_assunzione: '',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchDipendente();
    }
  }, [id]);

  const fetchDipendente = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/anagrafiche/dipendenti/${id}`);
      const data = response.data;
      // Converti tutti i null in stringhe vuote per i campi input
      setFormData({
        nome: data.nome || '',
        cognome: data.cognome || '',
        email: data.email || '',
        telefono: data.telefono || '',
        qualifica: data.qualifica || '',
        costo_orario: data.costo_orario ? String(data.costo_orario) : '',
        data_assunzione: data.data_assunzione ? data.data_assunzione.split('T')[0] : '',
        note: data.note || ''
      });
    } catch (err) {
      setError('Errore nel caricamento del dipendente');
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
      // Converti costo_orario in numero se presente, altrimenti null
      const dataToSend = {
        ...formData,
        costo_orario: formData.costo_orario && formData.costo_orario !== '' ? parseFloat(formData.costo_orario) : null
      };

      if (isEdit) {
        await api.put(`/anagrafiche/dipendenti/${id}`, dataToSend);
      } else {
        await api.post('/anagrafiche/dipendenti', dataToSend);
      }
      navigate('/anagrafiche/dipendenti');
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
          {isEdit ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualifica
              </label>
              <input
                type="text"
                name="qualifica"
                value={formData.qualifica}
                onChange={handleChange}
                placeholder="Es: Operaio, Tecnico, Responsabile..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Orario (€/h)
                </label>
                <input
                  type="number"
                  name="costo_orario"
                  value={formData.costo_orario}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="15.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Assunzione
                </label>
                <input
                  type="date"
                  name="data_assunzione"
                  value={formData.data_assunzione}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Dipendente')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/anagrafiche/dipendenti')}
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

export default DipendenteFormPage;
