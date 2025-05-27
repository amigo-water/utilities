// src/models/agreed-quantity.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { BaseModel } from './base.model';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface AgreedQuantityAttributes {
  id: string;
  consumerId: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  agreedQtyKL: number;
}

interface AgreedQuantityCreationAttributes extends Optional<AgreedQuantityAttributes, 'id'> {}

export class AgreedQuantity extends BaseModel<AgreedQuantityAttributes, AgreedQuantityCreationAttributes> implements AgreedQuantityAttributes {
  public id!: string;
  public consumerId!: string;
  public effectiveFrom!: Date;
  public effectiveTo!: Date | null;
  public agreedQtyKL!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: any) {
    return AgreedQuantity.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        consumerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        effectiveFrom: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        effectiveTo: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        agreedQtyKL: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'agreed_quantities',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

// Initialize the model
AgreedQuantity.initialize(sequelize);