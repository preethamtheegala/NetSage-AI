const express = require('express');
const router = express.Router();
const { checkRules } = require('../controllers/ruleCheckerController');

router.post('/', checkRules);

module.exports = router;
