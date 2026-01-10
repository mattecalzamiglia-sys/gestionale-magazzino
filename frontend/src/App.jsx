import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MagazzinoPage from './pages/MagazzinoPage';
import RicambioFormPage from './pages/RicambioFormPage';
import CommessePage from './pages/CommessePage';
import CommessaFormPage from './pages/CommessaFormPage';
import CommessaDetailPage from './pages/CommessaDetailPage';
import ClientiPage from './pages/ClientiPage';
import ClienteFormPage from './pages/ClienteFormPage';
import FornitoriPage from './pages/FornitoriPage';
import FornitoreFormPage from './pages/FornitoreFormPage';
import DipendentiPage from './pages/DipendentiPage';
import DipendenteFormPage from './pages/DipendenteFormPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Magazzino routes */}
          <Route path="/magazzino" element={<MagazzinoPage />} />
          <Route path="/magazzino/nuovo" element={<RicambioFormPage />} />
          <Route path="/magazzino/modifica/:id" element={<RicambioFormPage />} />
          
          {/* Commesse routes */}
          <Route path="/commesse" element={<CommessePage />} />
          <Route path="/commesse/nuova" element={<CommessaFormPage />} />
          <Route path="/commesse/modifica/:id" element={<CommessaFormPage />} />
          <Route path="/commesse/:id" element={<CommessaDetailPage />} />
          
          {/* Anagrafiche - Clienti */}
          <Route path="/anagrafiche/clienti" element={<ClientiPage />} />
          <Route path="/anagrafiche/clienti/nuovo" element={<ClienteFormPage />} />
          <Route path="/anagrafiche/clienti/modifica/:id" element={<ClienteFormPage />} />
          
          {/* Anagrafiche - Fornitori */}
          <Route path="/anagrafiche/fornitori" element={<FornitoriPage />} />
          <Route path="/anagrafiche/fornitori/nuovo" element={<FornitoreFormPage />} />
          <Route path="/anagrafiche/fornitori/modifica/:id" element={<FornitoreFormPage />} />
          
          {/* Anagrafiche - Dipendenti */}
          <Route path="/anagrafiche/dipendenti" element={<DipendentiPage />} />
          <Route path="/anagrafiche/dipendenti/nuovo" element={<DipendenteFormPage />} />
          <Route path="/anagrafiche/dipendenti/modifica/:id" element={<DipendenteFormPage />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
