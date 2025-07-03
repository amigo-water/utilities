// src/models/policy-version.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IPolicyVersionAttributes {
  id: string;
  policy_id: string;
  version: number;
  snapshot: Record<string, any>;
  changed_by: string;
  change_reason?: string;
  created_at?: Date;
}

export type PolicyVersionCreationAttributes = Omit<IPolicyVersionAttributes, 'id' | 'created_at'>;

export class PolicyVersion
  extends Model<IPolicyVersionAttributes, PolicyVersionCreationAttributes>
  implements IPolicyVersionAttributes {
  public id!: string;
  public policy_id!: string;
  public version!: number;
  public snapshot!: Record<string, any>;
  public changed_by!: string;
  public change_reason?: string;
  public readonly created_at!: Date;
}

PolicyVersion.init(
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    snapshot: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    change_reason: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'PolicyVersion',
    tableName: 'policy_versions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['policy_id', 'version']
      }
    ]
  }
);

export default PolicyVersion;
