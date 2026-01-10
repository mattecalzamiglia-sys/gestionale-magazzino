import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const [anagraficheOpen, setAnagraficheOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAnagraficheActive = () => {
    return location.pathname.startsWith('/anagrafiche');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold">
              Gestionale
            </Link>
            
            <nav className="flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded transition-colors ${
                  isActive('/dashboard') || location.pathname === '/'
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-500'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/magazzino"
                className={`px-4 py-2 rounded transition-colors ${
                  isActive('/magazzino')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-500'
                }`}
              >
                Magazzino
              </Link>
              
              <Link
                to="/commesse"
                className={`px-4 py-2 rounded transition-colors ${
                  isActive('/commesse')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-500'
                }`}
              >
                Commesse
              </Link>
              
              {/* Anagrafiche Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAnagraficheOpen(!anagraficheOpen)}
                  className={`px-4 py-2 rounded transition-colors flex items-center ${
                    isAnagraficheActive()
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-500'
                  }`}
                >
                  Anagrafiche
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform ${anagraficheOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {anagraficheOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/anagrafiche/clienti"
                      onClick={() => setAnagraficheOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Clienti
                    </Link>
                    <Link
                      to="/anagrafiche/fornitori"
                      onClick={() => setAnagraficheOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Fornitori
                    </Link>
                    <Link
                      to="/anagrafiche/dipendenti"
                      onClick={() => setAnagraficheOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dipendenti
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Gestionale Magazzino & Commesse © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
