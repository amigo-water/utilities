// src/models/bill.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { BaseModel } from './base.model';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BillAttributes {
  id: string;
  consumerId: string;
  utilityId: string;
  billingMonth: Date;
  policyId: string;
  categoryCode?: string | null;
  numberOfFlats?: number;
  pipeSizeMM?: number | null;
  consumptionKL?: number | null;
  baseWaterCess?: number | null;
  waterCessAppliedFrom?: string | null;
  sewerageCess?: number | null;
  serviceCharge?: number | null;
  totalAmount: number;
  status?: string;
  connectionType?: string | null;
}

interface BillCreationAttributes extends Optional<BillAttributes, 'id'> {}

export class Bill extends BaseModel<BillAttributes, BillCreationAttributes> implements BillAttributes {
  public id!: string;
  public consumerId!: string;
  public utilityId!: string;
  public billingMonth!: Date;
  public policyId!: string;
  public categoryCode!: string | null;
  public numberOfFlats!: number;
  public pipeSizeMM!: number | null;
  public consumptionKL!: number | null;
  public baseWaterCess!: number | null;
  public waterCessAppliedFrom!: string | null;
  public sewerageCess!: number | null;
  public serviceCharge!: number | null;
  public totalAmount!: number;
  public status!: string;
  public connectionType!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: any) {
    return Bill.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
          allowNull: false,
        },
        consumerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        utilityId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        billingMonth: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        policyId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        categoryCode: {
          type: DataTypes.STRING(10),
        },
        numberOfFlats: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        pipeSizeMM: {
          type: DataTypes.INTEGER,
        },
        consumptionKL: {
          type: DataTypes.DECIMAL(10, 2),
        },
        baseWaterCess: {
          type: DataTypes.DECIMAL(10, 2),
        },
        waterCessAppliedFrom: {
          type: DataTypes.STRING(50),
        },
        sewerageCess: {
          type: DataTypes.DECIMAL(10, 2),
        },
        serviceCharge: {
          type: DataTypes.DECIMAL(10, 2),
        },
        totalAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(20),
          defaultValue: 'unpaid',
        },
        connectionType: {
          type: DataTypes.STRING(20),
        },
      },
      {
        sequelize,
        tableName: 'bills',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

// Initialize the model
Bill.initialize(sequelize);