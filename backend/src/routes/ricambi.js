const express = require('express');
const router = express.Router();
const ricambiController = require('../controllers/ricambiController');

// Ricambi CRUD
router.get('/', ricambiController.getAllRicambi);
router.get('/:id', ricambiController.getRicambioById);
router.post('/', ricambiController.createRicambio);
router.put('/:id', ricambiController.updateRicambio);
router.delete('/:id', ricambiController.deleteRicambio);

// Operazioni magazzino
router.get('/:id/storico', ricambiController.getStoricoMovimenti);
router.post('/carico', ricambiController.caricoMagazzino);

module.exports = router;
