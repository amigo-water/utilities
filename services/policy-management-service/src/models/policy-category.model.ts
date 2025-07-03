import {
  Model,
  DataTypes
} from 'sequelize';
import sequelize from '../config/database';


export interface IPolicyCategoryAttributes {
  id: string;
  name: string;
  description?: string;
  utility_type_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type PolicyCategoryCreationAttributes = Omit<IPolicyCategoryAttributes, 'id' | 'created_at' | 'updated_at'>;

export class PolicyCategory
  extends Model<IPolicyCategoryAttributes, PolicyCategoryCreationAttributes>
  implements IPolicyCategoryAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public utility_type_id?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PolicyCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    utility_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'utility_type_id'  // ensure Sequelize maps this to DB column correctly
    }
  },
  {
    sequelize,
    modelName: 'PolicyCategory',
    tableName: 'policy_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default PolicyCategory;
