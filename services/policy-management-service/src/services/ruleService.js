const { RuleGroup, Rule, RuleException } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.defineRule = async (policyId, ruleGroupData, ruleData, exceptions = []) => {
  const ruleGroupId = uuidv4();
  const ruleId = uuidv4();

  // Insert Rule Group
  const group = await RuleGroup.create({
    id: ruleGroupId,
    policy_id: policyId,
    name: ruleGroupData.name,
    description: ruleGroupData.description,
    evaluation_order: ruleGroupData.evaluation_order,
    logical_operator: ruleGroupData.logical_operator,
    status: ruleGroupData.status,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Insert Rule
  const newRule = await Rule.create({
    id: ruleId,
    policy_id: policyId,
    rule_group_id: ruleGroupId,
    external_id: ruleData.external_id,
    name: ruleData.name,
    description: ruleData.description,
    condition_type: ruleData.condition_type,
    evaluation_phase: ruleData.evaluation_phase,
    priority: ruleData.priority,
    is_mandatory: ruleData.is_mandatory,
    status: ruleData.status,
    error_action: ruleData.error_action,
    execution_mode: ruleData.execution_mode,
    timeout_ms: ruleData.timeout_ms,
    retry_policy: ruleData.retry_policy,
    circuit_breaker: ruleData.circuit_breaker,
    conditions: ruleData.conditions,
    actions: ruleData.actions,
    metadata: ruleData.metadata,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Insert Exceptions if any
  const exceptionsCreated = [];
  for (const ex of exceptions) {
    const exception = await RuleException.create({
      id: uuidv4(),
      rule_id: ruleId,
      condition: ex.condition,
      override_action: ex.override_action,
      is_active: ex.is_active,
      created_at: new Date(),
      updated_at: new Date()
    });
    exceptionsCreated.push(exception);
  }

  return {
    ruleGroup: group,
    rule: newRule,
    exceptions: exceptionsCreated
  };
};


exports.createRule = async (ruleData) => {
  console.log(ruleData);
  const ruleId = uuidv4();

  const newRule = await Rule.create({
    id: ruleId,
    policy_id: ruleData.policy_id,
    external_id: ruleData.external_id,
    name: ruleData.name,
    description: ruleData.description,
    condition_type: ruleData.condition_type,
    evaluation_phase: ruleData.evaluation_phase || 'Pre',
    priority: ruleData.priority || 1,
    is_mandatory: ruleData.is_mandatory ?? true,
    status: ruleData.status || 'Active',
    error_action: ruleData.error_action || null,
    execution_mode: ruleData.execution_mode || 'Parallel',
    timeout_ms: ruleData.timeout_ms || 5000,
    retry_policy: ruleData.retry_policy || {},
    circuit_breaker: ruleData.circuit_breaker || {},
    conditions: ruleData.conditions, // JSON logic here
    actions: ruleData.actions || {},
    metadata: ruleData.metadata || {},
    created_at: new Date(),
    updated_at: new Date()
  });

  return newRule;
};





