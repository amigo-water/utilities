// src/models/meter-reading.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { BaseModel } from './base.model';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface MeterReadingAttributes {
  readingId: string;
  consumerId: string;
  billingMonth: Date;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingSource?: string | null;
}

interface MeterReadingCreationAttributes extends Optional<MeterReadingAttributes, 'readingId' | 'consumption' | 'readingSource'> {}

export class MeterReading extends BaseModel<MeterReadingAttributes, MeterReadingCreationAttributes> implements MeterReadingAttributes {
  public readingId!: string;
  public consumerId!: string;
  public billingMonth!: Date;
  public previousReading!: number;
  public currentReading!: number;
  public consumption!: number;
  public readingSource!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: any) {
    return MeterReading.init(
      {
        readingId: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        consumerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        billingMonth: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        previousReading: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        currentReading: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        consumption: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        readingSource: {
          type: DataTypes.STRING(50),
        },
      },
      {
        sequelize,
        tableName: 'meter_readings',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

// Initialize the model
MeterReading.initialize(sequelize);