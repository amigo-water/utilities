const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

router.post('/policy/:policyId', ruleController.defineRuleForPolicy);
router.post('/evaluate/:id', ruleController.evaluateRule);
router.post('/create', ruleController.createRule);


module.exports = router;
