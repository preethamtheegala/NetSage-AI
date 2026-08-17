const express = require('express');
const router = express.Router();
const { getCases, getCaseById, createCase, updateCase, deleteCase } = require('../controllers/casesController');

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
