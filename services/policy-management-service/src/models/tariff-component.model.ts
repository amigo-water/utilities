// src/models/tariff-component.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';


export type ComponentType =
  | 'FixedCharge'
  | 'VolumetricRate'
  | 'DemandCharge'
  | 'TimeOfUse'
  | 'Surcharge'
  | 'Rebate';

export type CalculationModel =
  | 'Stepped'
  | 'Blocked'
  | 'Seasonal'
  | 'TimeOfDay'
  | 'CapacityBased';

export interface ITariffComponentAttributes {
  id: string;
  tariff_plan_id: string;
  component_type?: ComponentType;
  calculation_model?: CalculationModel;
  parameters: Record<string, any>;
  precedence: number;
}

export type TariffComponentCreationAttributes = Omit<
  ITariffComponentAttributes,
  'id'
>;

export class TariffComponent
  extends Model<ITariffComponentAttributes, TariffComponentCreationAttributes>
  implements ITariffComponentAttributes
{
  public id!: string;
  public tariff_plan_id!: string;
  public component_type?: ComponentType;
  public calculation_model?: CalculationModel;
  public parameters!: Record<string, any>;
  public precedence!: number;
}

TariffComponent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tariff_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tariff_plans',
        key: 'id'
      }
    },
    component_type: {
      type: DataTypes.ENUM(
        'FixedCharge',
        'VolumetricRate',
        'DemandCharge',
        'TimeOfUse',
        'Surcharge',
        'Rebate'
      )
    },
    calculation_model: {
      type: DataTypes.ENUM(
        'Stepped',
        'Blocked',
        'Seasonal',
        'TimeOfDay',
        'CapacityBased'
      )
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    precedence: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'TariffComponent',
    tableName: 'tariff_components',
    timestamps: false
  }
);


export default TariffComponent;
