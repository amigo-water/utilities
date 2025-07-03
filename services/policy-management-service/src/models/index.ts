// src/models/index.ts
import Policy from './policy.model';
import PolicyCategory from './policy-category.model';
import PolicyVersion from './policy-version.model';
import RuleGroup from './rule-group.model';
import Rule from './rule.model';
import RuleEvaluation from './rule-evaluation.model';
import RuleException from './rule-exception.model';
import RuleExecutionStats from './rule-execution-stats.model';
import RuleEvaluationContext from './rule-evaluation-context.model';
import TariffPlan from './tariff-plan.model';
import TariffComponent from './tariff-component.model';

// Define associations after model imports

Policy.belongsTo(PolicyCategory, { foreignKey: 'category_id' });
PolicyCategory.hasMany(Policy, { foreignKey: 'category_id' });

Policy.hasMany(PolicyVersion, { foreignKey: 'policy_id' });
PolicyVersion.belongsTo(Policy, { foreignKey: 'policy_id' });

Policy.hasMany(RuleGroup, { foreignKey: 'policy_id' });
RuleGroup.belongsTo(Policy, { foreignKey: 'policy_id' });

RuleGroup.hasMany(Rule, { foreignKey: 'rule_group_id' });
Rule.belongsTo(RuleGroup, { foreignKey: 'rule_group_id' });

Policy.hasMany(Rule, { foreignKey: 'policy_id' });
Rule.belongsTo(Policy, { foreignKey: 'policy_id' });

Rule.hasMany(RuleException, { foreignKey: 'rule_id' });
RuleException.belongsTo(Rule, { foreignKey: 'rule_id' });

Rule.hasOne(RuleExecutionStats, { foreignKey: 'rule_id' });
RuleExecutionStats.belongsTo(Rule, { foreignKey: 'rule_id' });

TariffPlan.hasMany(TariffComponent, { foreignKey: 'tariff_plan_id' });
TariffComponent.belongsTo(TariffPlan, { foreignKey: 'tariff_plan_id' });

Rule.hasMany(RuleEvaluation, { foreignKey: 'rule_id' });
RuleEvaluation.belongsTo(Rule, { foreignKey: 'rule_id' });

Policy.hasMany(RuleEvaluation, { foreignKey: 'policy_id' });
RuleEvaluation.belongsTo(Policy, { foreignKey: 'policy_id' });

export {
  Policy,
  PolicyCategory,
  PolicyVersion,
  RuleGroup,
  Rule,
  RuleEvaluation,
  RuleException,
  RuleExecutionStats,
  RuleEvaluationContext,
  TariffPlan,
  TariffComponent,
};
