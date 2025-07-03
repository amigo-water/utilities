// src/models/rule-group.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IRuleGroupAttributes {
  id: string;
  policy_id: string;
  name: string;
  description?: string;
  evaluation_order: number;
  logical_operator?: 'AND' | 'OR';
  status: 'Active' | 'Inactive';
  created_at?: Date;
  updated_at?: Date;
}

export type RuleGroupCreationAttributes = Omit<
  IRuleGroupAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class RuleGroup
  extends Model<IRuleGroupAttributes, RuleGroupCreationAttributes>
  implements IRuleGroupAttributes
{
  public id!: string;
  public policy_id!: string;
  public name!: string;
  public description?: string;
  public evaluation_order!: number;
  public logical_operator?: 'AND' | 'OR';
  public status!: 'Active' | 'Inactive';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RuleGroup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    policy_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'policies',
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
    evaluation_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    logical_operator: {
      type: DataTypes.ENUM('AND', 'OR')
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'RuleGroup',
    tableName: 'rule_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default RuleGroup;
