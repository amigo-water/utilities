// src/models/bill-status-audit.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { BaseModel } from './base.model';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BillStatusAuditAttributes {
  auditId: string;
  billId: string;
  oldStatus: string | null;
  newStatus: string;
  changedAt?: Date;
  changedBy?: string | null;
}

interface BillStatusAuditCreationAttributes extends Optional<BillStatusAuditAttributes, 'auditId' | 'changedAt'> {}

export class BillStatusAudit extends BaseModel<BillStatusAuditAttributes, BillStatusAuditCreationAttributes> implements BillStatusAuditAttributes {
  public auditId!: string;
  public billId!: string;
  public oldStatus!: string | null;
  public newStatus!: string;
  public changedAt!: Date;
  public changedBy!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: any) {
    return BillStatusAudit.init(
      {
        auditId: {
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
        oldStatus: {
          type: DataTypes.STRING(20),
        },
        newStatus: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        changedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        changedBy: {
          type: DataTypes.UUID,
        },
      },
      {
        sequelize,
        tableName: 'bill_status_audit',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

// Initialize the model
BillStatusAudit.initialize(sequelize);