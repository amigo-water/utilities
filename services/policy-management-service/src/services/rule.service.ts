import { Rule} from '../models';
import { ConditionType, ErrorAction, EvaluationPhase, ExecutionMode, RuleStatus } from '../models/rule.model';

interface RuleInput {
  policy_id: string;
  external_id?: string;
  name: string;
  description?: string;
  condition_type: string;
  evaluation_phase?: string;
  priority?: number;
  is_mandatory?: boolean;
  status?: string;
  error_action?: string | null;
  execution_mode?: string;
  timeout_ms?: number;
  retry_policy?: Record<string, any>;
  circuit_breaker?: Record<string, any>;
  conditions: any;
  actions?: any;
  metadata?: Record<string, any>;
}

export class RuleService {
  async createRule(ruleData: RuleInput): Promise<Rule> {
    const newRule = await Rule.create({
      policy_id: ruleData.policy_id,
      external_id: ruleData.external_id,
      name: ruleData.name,
      description: ruleData.description,
      condition_type: ruleData.condition_type as ConditionType,
      evaluation_phase: ruleData.evaluation_phase as EvaluationPhase,
      priority: ruleData.priority || 1,
      is_mandatory: ruleData.is_mandatory ?? true,
      status: ruleData.status as RuleStatus,
      error_action: ruleData.error_action as ErrorAction,
      execution_mode: ruleData.execution_mode as ExecutionMode,
      timeout_ms: ruleData.timeout_ms || 5000,
      retry_policy: ruleData.retry_policy || {},
      circuit_breaker: ruleData.circuit_breaker || {},
      conditions: ruleData.conditions,
      actions: ruleData.actions || {},
      metadata: ruleData.metadata || {},
    });

    return newRule;
  }
}

export const ruleService = new RuleService();
