import express from 'express';
import { PolicyController } from '../controllers/policy.controller';
import { PolicyCategoryController } from '../controllers/policy-category.controller';

const router = express.Router();
const policyController = new PolicyController();
const policyCategoryController = new PolicyCategoryController();

router.post('/policies', policyController.createPolicy.bind(policyController) as any);

router.post('/policy-categories', policyCategoryController.createCategory.bind(policyCategoryController) as any);
router.post('/policiesWithCategories',policyCategoryController.createPolicyWithCategory.bind(policyCategoryController) as any)

export default router;
