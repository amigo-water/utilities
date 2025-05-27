// src/models/bill-component.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { BaseModel } from './base.model';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BillComponentAttributes {
  billComponentId: string;
  billId: string;
  type: string;
  description?: string | null;
  amount: number;
  isAddition?: boolean;
}

interface BillComponentCreationAttributes extends Optional<BillComponentAttributes, 'billComponentId'> {}

export class BillComponent extends BaseModel<BillComponentAttributes, BillComponentCreationAttributes> implements BillComponentAttributes {
  public billComponentId!: string;
  public billId!: string;
  public type!: string;
  public description!: string | null;
  public amount!: number;
  public isAddition!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: any) {
    const model = BillComponent.init(
      {
        billComponentId: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        billId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'bills',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        isAddition: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'bill_components',
        timestamps: true,
        underscored: true,
      }
    );

    return model;
  }
}

// Initialize the model
BillComponent.initialize(sequelize);