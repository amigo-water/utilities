import { DataTypes ,Model } from 'sequelize';
import sequelize from '../config/database'

export type PolicyStatus = 'Draft' | 'Active' | 'Inactive' | 'Archived';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IPolicyAttributes {
  id: string;
  external_id?: string;
  name: string;
  description?: string;
  effective_from: Date;
  effective_to?: Date;
  version: number;
  status: PolicyStatus;
  approval_status?: ApprovalStatus;
  category_id?: string;
  utility_type_id?: string;
  created_by: string;
  approved_by?: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export type PolicyCreationAttributes = Omit<IPolicyAttributes, 'id' | 'created_at' | 'updated_at'>;

export class Policy extends Model<IPolicyAttributes, PolicyCreationAttributes>
  implements IPolicyAttributes {
  public id!: string;
  public external_id?: string;
  public name!: string;
  public description?: string;
  public effective_from!: Date;
  public effective_to?: Date;
  public version!: number;
  public status!: 'Draft' | 'Active' | 'Inactive' | 'Archived';
  public approval_status?: 'Pending' | 'Approved' | 'Rejected';
  public category_id?: string;
  public utility_type_id?: string;
  public created_by!: string;
  public approved_by?: string;
  public metadata?: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Policy.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  external_id: {
    type: DataTypes.STRING(50)
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  effective_from: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  effective_to: {
    type: DataTypes.DATE
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Active', 'Inactive', 'Archived'),
    allowNull: false
  },
  approval_status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected')
  },
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: 'policy_categories',
      key: 'id'
    }
  },
  utility_type_id: {
    type: DataTypes.UUID
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approved_by: {
    type: DataTypes.UUID
  },
  metadata: {
    type: DataTypes.JSONB
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Policy',
  tableName: 'policies',
  schema: 'public',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Policy;
