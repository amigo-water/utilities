// src/models/rule-exception.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IRuleExceptionAttributes {
  id: string;
  rule_id: string;
  condition: Record<string, any>;
  override_action?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type RuleExceptionCreationAttributes = Omit<
  IRuleExceptionAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class RuleException
  extends Model<IRuleExceptionAttributes, RuleExceptionCreationAttributes>
  implements IRuleExceptionAttributes
{
  public id!: string;
  public rule_id!: string;
  public condition!: Record<string, any>;
  public override_action?: string;
  public is_active?: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RuleException.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rules',
        key: 'id'
      }
    },
    condition: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    override_action: {
      type: DataTypes.JSONB
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'RuleException',
    tableName: 'rule_exceptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default RuleException;
