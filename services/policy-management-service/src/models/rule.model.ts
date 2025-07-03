import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export type ConditionType = 'Simple' | 'Composite';
export type EvaluationPhase = 'Pre' | 'Post' | 'Final';
export type RuleStatus = 'Draft' | 'Active' | 'Inactive' | 'Archived';
export type ErrorAction = 'Continue' | 'Stop' | 'Rollback';
export type ExecutionMode = 'Parallel' | 'Sequential';

export interface IRuleAttributes {
  id: string;
  external_id?: string;
  policy_id: string;
  rule_group_id?: string;
  name: string;
  description?: string;
  condition_type: ConditionType;
  evaluation_phase?: EvaluationPhase;
  priority: number;
  is_mandatory?: boolean;
  status: RuleStatus;
  error_action?: ErrorAction;
  execution_mode?: ExecutionMode;
  timeout_ms?: number;
  retry_policy?: Record<string, any>;
  circuit_breaker?: Record<string, any>;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export type RuleCreationAttributes = Omit<IRuleAttributes, 'id' | 'created_at' | 'updated_at'>;

export class Rule extends Model<IRuleAttributes, RuleCreationAttributes> implements IRuleAttributes {
  public id!: string;
  public external_id?: string;
  public policy_id!: string;
  public rule_group_id?: string;
  public name!: string;
  public description?: string;
  public condition_type!: ConditionType;
  public evaluation_phase?: EvaluationPhase;
  public priority!: number;
  public is_mandatory?: boolean;
  public status!: RuleStatus;
  public error_action?: ErrorAction;
  public execution_mode?: ExecutionMode;
  public timeout_ms?: number;
  public retry_policy?: Record<string, any>;
  public circuit_breaker?: Record<string, any>;
  public conditions?: Record<string, any>;
  public actions?: Record<string, any>;
  public metadata?: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Rule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    external_id: {
      type: DataTypes.STRING(50)
    },
    policy_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'policies',
        key: 'id'
      }
    },
    rule_group_id: {
      type: DataTypes.UUID,
      references: {
        model: 'rule_groups',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    condition_type: {
      type: DataTypes.ENUM('Simple', 'Composite'),
      allowNull: false
    },
    evaluation_phase: {
      type: DataTypes.ENUM('Pre', 'Post', 'Final')
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_mandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Active', 'Inactive', 'Archived'),
      allowNull: false
    },
    error_action: {
      type: DataTypes.ENUM('Continue', 'Stop', 'Rollback')
    },
    execution_mode: {
      type: DataTypes.ENUM('Parallel', 'Sequential'),
      defaultValue: 'Parallel'
    },
    timeout_ms: {
      type: DataTypes.INTEGER,
      defaultValue: 5000
    },
    retry_policy: {
      type: DataTypes.JSONB
    },
    circuit_breaker: {
      type: DataTypes.JSONB
    },
    conditions: {
      type: DataTypes.JSONB
    },
    actions: {
      type: DataTypes.JSONB
    },
    metadata: {
      type: DataTypes.JSONB
    }
  },
  {
    sequelize,
    modelName: 'Rule',
    tableName: 'rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Rule;
