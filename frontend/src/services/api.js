import axios from 'axios';

// URL del backend su Render (lo aggiorneremo dopo il deploy)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://YOUR-RENDER-APP.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ricambi
export const ricambiAPI = {
  getAll: (params) => api.get('/ricambi', { params }),
  getById: (id) => api.get(`/ricambi/${id}`),
  create: (data) => api.post('/ricambi', data),
  update: (id, data) => api.put(`/ricambi/${id}`, data),
  delete: (id) => api.delete(`/ricambi/${id}`),
  getStorico: (id) => api.get(`/ricambi/${id}/storico`),
  carico: (data) => api.post('/ricambi/carico', data),
};

// Commesse
export const commesseAPI = {
  getAll: (params) => api.get('/commesse', { params }),
  getById: (id) => api.get(`/commesse/${id}`),
  create: (data) => api.post('/commesse', data),
  update: (id, data) => api.put(`/commesse/${id}`, data),
  delete: (id) => api.delete(`/commesse/${id}`),
  scaricoRicambio: (data) => api.post('/commesse/scarico-ricambio', data),
  registraOre: (data) => api.post('/commesse/registra-ore', data),
  aggiungiCosto: (data) => api.post('/commesse/costo-aggiuntivo', data),
};

// Dipendenti
export const dipendentiAPI = {
  getAll: (params) => api.get('/anagrafiche/dipendenti', { params }),
  getById: (id) => api.get(`/anagrafiche/dipendenti/${id}`),
  create: (data) => api.post('/anagrafiche/dipendenti', data),
  update: (id, data) => api.put(`/anagrafiche/dipendenti/${id}`, data),
  delete: (id) => api.delete(`/anagrafiche/dipendenti/${id}`),
};

// Clienti
export const clientiAPI = {
  getAll: () => api.get('/anagrafiche/clienti'),
  getById: (id) => api.get(`/anagrafiche/clienti/${id}`),
  create: (data) => api.post('/anagrafiche/clienti', data),
  update: (id, data) => api.put(`/anagrafiche/clienti/${id}`, data),
  delete: (id) => api.delete(`/anagrafiche/clienti/${id}`),
};

// Fornitori
export const fornitoriAPI = {
  getAll: () => api.get('/anagrafiche/fornitori'),
  getById: (id) => api.get(`/anagrafiche/fornitori/${id}`),
  create: (data) => api.post('/anagrafiche/fornitori', data),
  update: (id, data) => api.put(`/anagrafiche/fornitori/${id}`, data),
  delete: (id) => api.delete(`/anagrafiche/fornitori/${id}`),
};

export default api;
