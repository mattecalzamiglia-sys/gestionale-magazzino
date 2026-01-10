import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totaleRicambi: 0,
    ricambiSottoScorta: 0,
    totaleCommesse: 0,
    commesseAperte: 0,
    commesseInCorso: 0,
    valoreMagazzino: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch ricambi
      const ricambiRes = await api.get('/ricambi');
      const ricambi = ricambiRes.data || [];
      
      // Fetch commesse
      const commesseRes = await api.get('/commesse');
      const commesse = commesseRes.data || [];

      // Calcola statistiche
      const ricambiSottoScorta = ricambi.filter(r => 
        r.scorta_minima && r.quantita <= r.scorta_minima
      ).length;

      const valoreMagazzino = ricambi.reduce((sum, r) => 
        sum + (parseFloat(r.prezzo_unitario || 0) * parseInt(r.quantita || 0)), 0
      );

      const commesseAperte = commesse.filter(c => c.stato === 'aperta').length;
      const commesseInCorso = commesse.filter(c => c.stato === 'in_corso').length;

      setStats({
        totaleRicambi: ricambi.length,
        ricambiSottoScorta,
        totaleCommesse: commesse.length,
        commesseAperte,
        commesseInCorso,
        valoreMagazzino
      });
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento statistiche:', err);
      setError('Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Caricamento dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Panoramica generale del gestionale</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Magazzino Card */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/magazzino')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Magazzino</h3>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Totale Ricambi:</span>
              <span className="font-bold text-gray-900">{stats.totaleRicambi}</span>
            </div>
            {stats.ricambiSottoScorta > 0 && (
              <div className="flex justify-between">
                <span className="text-red-600">Sotto Scorta:</span>
                <span className="font-bold text-red-600">{stats.ricambiSottoScorta}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Valore Totale:</span>
              <span className="font-bold text-green-600">
                €{stats.valoreMagazzino.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Commesse Card */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/commesse')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Commesse</h3>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Totale:</span>
              <span className="font-bold text-gray-900">{stats.totaleCommesse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Aperte:</span>
              <span className="font-bold text-blue-600">{stats.commesseAperte}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">In Corso:</span>
              <span className="font-bold text-yellow-600">{stats.commesseInCorso}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Azioni Rapide</h3>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/magazzino/nuovo')}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              + Nuovo Ricambio
            </button>
            <button
              onClick={() => navigate('/commesse/nuova')}
              className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded"
            >
              + Nuova Commessa
            </button>
            <button
              onClick={() => navigate('/anagrafiche/clienti')}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
            >
              Gestisci Clienti
            </button>
            <button
              onClick={() => navigate('/anagrafiche/fornitori')}
              className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded"
            >
              Gestisci Fornitori
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {stats.totaleRicambi === 0 && stats.totaleCommesse === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            👋 Benvenuto nel Gestionale!
          </h3>
          <p className="text-blue-700 mb-4">
            Per iniziare, aggiungi i tuoi primi dati:
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-blue-800">
              <span className="mr-2">1.</span>
              <span>Crea clienti e fornitori nella sezione <strong>Anagrafiche</strong></span>
            </div>
            <div className="flex items-center text-blue-800">
              <span className="mr-2">2.</span>
              <span>Aggiungi ricambi nel <strong>Magazzino</strong></span>
            </div>
            <div className="flex items-center text-blue-800">
              <span className="mr-2">3.</span>
              <span>Crea le tue prime <strong>Commesse</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
