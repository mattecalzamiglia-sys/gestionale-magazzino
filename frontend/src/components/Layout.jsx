import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-700' : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-primary-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold">Gestionale</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/"
                  className={`${isActive('/')} inline-flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/magazzino"
                  className={`${isActive('/magazzino')} inline-flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Magazzino
                </Link>
                <Link
                  to="/commesse"
                  className={`${isActive('/commesse')} inline-flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Commesse
                </Link>
                <Link
                  to="/anagrafiche"
                  className={`${isActive('/anagrafiche')} inline-flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Anagrafiche
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
