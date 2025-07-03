// src/models/tariff-plan.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export type BillingFrequency = 'Monthly' | 'BiMonthly' | 'Quarterly';

export interface ITariffPlanAttributes {
  id: string;
  utility_type_id?: string;
  name: string;
  billing_frequency?: BillingFrequency;
  currency: string;
  tax_policy?: Record<string, any>;
  effective_start: Date;
  effective_end?: Date;
  version_hash: Buffer;
  is_default?: boolean;
}

export type TariffPlanCreationAttributes = Omit<ITariffPlanAttributes, 'id'>;

export class TariffPlan
  extends Model<ITariffPlanAttributes, TariffPlanCreationAttributes>
  implements ITariffPlanAttributes
{
  public id!: string;
  public utility_type_id?: string;
  public name!: string;
  public billing_frequency?: BillingFrequency;
  public currency!: string;
  public tax_policy?: Record<string, any>;
  public effective_start!: Date;
  public effective_end?: Date;
  public version_hash!: Buffer;
  public is_default?: boolean;
}

TariffPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    utility_type_id: {
      type: DataTypes.UUID
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    billing_frequency: {
      type: DataTypes.ENUM('Monthly', 'BiMonthly', 'Quarterly')
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    tax_policy: {
      type: DataTypes.JSONB
    },
    effective_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    effective_end: {
      type: DataTypes.DATE
    },
    version_hash: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'TariffPlan',
    tableName: 'tariff_plans',
    timestamps: false
  }
);

export default TariffPlan;
