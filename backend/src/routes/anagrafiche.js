const express = require('express');
const router = express.Router();
const anagraficheController = require('../controllers/anagraficheController');

// Dipendenti
router.get('/dipendenti', anagraficheController.getAllDipendenti);
router.get('/dipendenti/:id', anagraficheController.getDipendenteById);
router.post('/dipendenti', anagraficheController.createDipendente);
router.put('/dipendenti/:id', anagraficheController.updateDipendente);
router.delete('/dipendenti/:id', anagraficheController.deleteDipendente);

// Clienti
router.get('/clienti', anagraficheController.getAllClienti);
router.get('/clienti/:id', anagraficheController.getClienteById);
router.post('/clienti', anagraficheController.createCliente);
router.put('/clienti/:id', anagraficheController.updateCliente);
router.delete('/clienti/:id', anagraficheController.deleteCliente);

// Fornitori
router.get('/fornitori', anagraficheController.getAllFornitori);
router.get('/fornitori/:id', anagraficheController.getFornitoreById);
router.post('/fornitori', anagraficheController.createFornitore);
router.put('/fornitori/:id', anagraficheController.updateFornitore);
router.delete('/fornitori/:id', anagraficheController.deleteFornitore);

module.exports = router;
