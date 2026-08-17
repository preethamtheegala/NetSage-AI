const express = require('express');
const router = express.Router();
const { runFullDiagnosis, getDiagnosisById } = require('../controllers/diagnosisController');

router.post('/', runFullDiagnosis);
router.get('/:id', getDiagnosisById);

module.exports = router;
