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

// Modifica/Elimina movimenti ricambi
router.put('/movimento-ricambio/:id', commesseController.updateMovimentoRicambio);
router.delete('/movimento-ricambio/:id', commesseController.deleteMovimentoRicambio);

// Modifica/Elimina ore lavoro
router.put('/ore-lavoro/:id', commesseController.updateOreLavoro);
router.delete('/ore-lavoro/:id', commesseController.deleteOreLavoro);

module.exports = router;
