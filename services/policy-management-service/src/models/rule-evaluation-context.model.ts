// src/models/rule-evaluation-context.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IRuleEvaluationContextAttributes {
  id: string;
  name: string;
  description?: string;
  context_schema: Record<string, any>;
  utility_type_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RuleEvaluationContextCreationAttributes = Omit<
  IRuleEvaluationContextAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class RuleEvaluationContext
  extends Model<IRuleEvaluationContextAttributes, RuleEvaluationContextCreationAttributes>
  implements IRuleEvaluationContextAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public context_schema!: Record<string, any>;
  public utility_type_id?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RuleEvaluationContext.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    context_schema: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    utility_type_id: {
      type: DataTypes.UUID
    }
  },
  {
    sequelize,
    modelName: 'RuleEvaluationContext',
    tableName: 'rule_evaluation_contexts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default RuleEvaluationContext;
