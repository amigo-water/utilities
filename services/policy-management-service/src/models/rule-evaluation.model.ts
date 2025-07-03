// src/models/rule-evaluation.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export type EvaluationStatus = 'Success' | 'Failed' | 'Partial';

export interface IRuleEvaluationAttributes {
  id: string;
  evaluation_id: string;
  consumer_id: string;
  policy_id?: string;
  rule_id?: string;
  evaluation_context: Record<string, any>;
  evaluation_result: Record<string, any>;
  status: EvaluationStatus;
  evaluation_start: Date;
  evaluation_end: Date;
  initiated_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export type RuleEvaluationCreationAttributes = Omit<IRuleEvaluationAttributes, 'id'>;

export class RuleEvaluation extends Model<IRuleEvaluationAttributes, RuleEvaluationCreationAttributes>
  implements IRuleEvaluationAttributes {
  public id!: string;
  public evaluation_id!: string;
  public consumer_id!: string;
  public policy_id?: string;
  public rule_id?: string;
  public evaluation_context!: Record<string, any>;
  public evaluation_result!: Record<string, any>;
  public status!: EvaluationStatus;
  public evaluation_start!: Date;
  public evaluation_end!: Date;
  public initiated_by?: string;
  public notes?: string;
  public metadata?: Record<string, any>;
}

RuleEvaluation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    evaluation_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    consumer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    policy_id: {
      type: DataTypes.UUID,
      references: {
        model: 'policies',
        key: 'id'
      }
    },
    rule_id: {
      type: DataTypes.UUID,
      references: {
        model: 'rules',
        key: 'id'
      }
    },
    evaluation_context: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    evaluation_result: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Success', 'Failed', 'Partial'),
      allowNull: false
    },
    evaluation_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    evaluation_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    initiated_by: {
      type: DataTypes.STRING(50)
    },
    notes: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB
    }
  },
  {
    sequelize,
    modelName: 'RuleEvaluation',
    tableName: 'rule_evaluations',
    timestamps: false
  }
);


export default RuleEvaluation;
