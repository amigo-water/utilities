const ruleService = require('../services/ruleService');
const { v4: uuidv4 } = require('uuid');
const Rule = require('../models/Rule');
const RuleEvaluation = require('../models/RuleEvaluation');
const { evaluateRule } = require('../services/ruleEngine');

exports.defineRuleForPolicy = async (req, res) => {
  const { policyId } = req.params;
  const { ruleGroup, rule, exceptions } = req.body;

  try {
    const result = await ruleService.defineRule(policyId, ruleGroup, rule, exceptions);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error defining rule:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.evaluateRule = async (req, res) => {
  const { id } = req.params;
  const context = req.body;
  const evaluationStart = new Date();

  try {
    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    console.log(rule.conditions);
    const result = evaluateRule(rule.conditions, context);
    console.log(result);
    const evaluationEnd = new Date();

    const newEvaluation = await RuleEvaluation.create({
      id: uuidv4(),
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

    res.json({ result, evaluation_id: newEvaluation.evaluation_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.createRule = async (req, res) => {
  try {
    const ruleData = req.body;
    const result = await ruleService.createRule(ruleData);
    res.status(201).json({
      message: 'Rule created successfully',
      rule: result
    });
  } catch (err) {
    res.status(500).json({
      message: 'Rule creation failed',
      error: err.message
    });
  }
};





