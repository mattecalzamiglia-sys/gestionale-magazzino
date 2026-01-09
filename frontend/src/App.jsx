import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MagazzinoPage from './pages/MagazzinoPage';
import CommessePage from './pages/CommessePage';
import CommessaDetailPage from './pages/CommessaDetailPage';

// Placeholder per pagine da completare
const DashboardPage = () => (
  <div className="px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ricambi Sotto Scorta</h3>
        <p className="text-3xl font-bold text-red-600">-</p>
      </div>
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Commesse Aperte</h3>
        <p className="text-3xl font-bold text-blue-600">-</p>
      </div>
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Margine Medio</h3>
        <p className="text-3xl font-bold text-green-600">-</p>
      </div>
    </div>
  </div>
);

const AnagrafichePage = () => (
  <div className="px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Anagrafiche</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-medium text-gray-900 mb-2">👥 Dipendenti</h3>
        <p className="text-sm text-gray-600">Gestione dipendenti e costi orari</p>
      </div>
      <div className="card hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-medium text-gray-900 mb-2">🏢 Clienti</h3>
        <p className="text-sm text-gray-600">Anagrafica clienti</p>
      </div>
      <div className="card hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-medium text-gray-900 mb-2">🚚 Fornitori</h3>
        <p className="text-sm text-gray-600">Gestione fornitori ricambi</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/magazzino" element={<MagazzinoPage />} />
          <Route path="/commesse" element={<CommessePage />} />
          <Route path="/commesse/:id" element={<CommessaDetailPage />} />
          <Route path="/anagrafiche" element={<AnagrafichePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
