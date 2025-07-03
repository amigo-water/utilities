import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {ruleService} from '../services/rule.service';
import Rule from '../models/rule.model';
import RuleEvaluation from '../models/rule-evaluation.model';
import { evaluateRule } from '../services/rule-engine.service';

export class RuleController {
  constructor() {}

  async evaluateRuleHandler(req: Request, res: Response) {
    const { id } = req.params;
    const context = req.body;
    const evaluationStart = new Date();

    try {
      const rule = await Rule.findByPk(id);
      if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      console.log(rule.conditions);
      const result = await evaluateRule(rule.conditions, context);
      console.log(result);

      const evaluationEnd = new Date();

      const newEvaluation = await RuleEvaluation.create({
        evaluation_id: uuidv4(),
        consumer_id: context.consumerId || uuidv4(),
        policy_id: rule.policy_id,
        rule_id: rule.id,
        evaluation_context: context,
        evaluation_result: { result },
        status: 'Success',
        evaluation_start: evaluationStart,
        evaluation_end: evaluationEnd,
        initiated_by: context.initiatedBy || 'system',
        notes: context.notes || null,
        metadata: {}
      });

      return res.json({ result, evaluation_id: newEvaluation.evaluation_id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  async createRule(req: Request, res: Response): Promise<Response> {
    try {
      const ruleData = req.body;
      const result = await ruleService.createRule(ruleData);
      return res.status(201).json({
        message: 'Rule created successfully',
        rule: result
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Rule creation failed',
        error: err.message
      });
    }
  }
}
