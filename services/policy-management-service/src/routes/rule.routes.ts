import express from 'express';
import { RuleController } from '../controllers/rule.controller';

const router = express.Router();
const ruleController = new RuleController();

router.post('/evaluate/:id', ruleController.evaluateRuleHandler.bind(ruleController) as any);
router.post('/create', ruleController.createRule.bind(ruleController) as any);

export default router;
