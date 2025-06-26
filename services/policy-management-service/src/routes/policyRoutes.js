const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const policyCategoryController = require('../controllers/policyCategoryController');

router.post('/policies', policyController.createPolicy);




router.post('/policy-categories', policyCategoryController.createCategory);
router.post('/policiesWithCategories', policyCategoryController.createPolicyWithCategory);


module.exports = router;
