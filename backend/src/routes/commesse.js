const express = require('express');
const router = express.Router();
const commesseController = require('../controllers/commesseController');

// Commesse CRUD
router.get('/', commesseController.getAllCommesse);
router.get('/:id', commesseController.getCommessaById);
router.post('/', commesseController.createCommessa);
router.put('/:id', commesseController.updateCommessa);
router.delete('/:id', commesseController.deleteCommessa);

// Operazioni su commessa
router.post('/scarico-ricambio', commesseController.scaricoRicambio);
router.post('/registra-ore', commesseController.registraOreLavoro);
router.post('/costo-aggiuntivo', commesseController.aggiungiCostoAggiuntivo);

module.exports = router;
