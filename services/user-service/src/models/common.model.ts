import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface IHierarchyItem {
  id: number;
  type: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: number;
  metadata?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class HierarchyItem
  extends Model<IHierarchyItem>
  implements IHierarchyItem
{
  public id!: number;
  public type!: string;
  public code!: string;
  public name!: string;
  public description?: string;
  public parent_id?: number;
  public metadata?: any;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public readonly children?: HierarchyItem[];
  public readonly parent?: HierarchyItem;
  static async findByType(type: string): Promise<HierarchyItem[]> {
    return HierarchyItem.findAll({
      where: { type, is_active: true },
      include: [
        {
          model: HierarchyItem,
          as: "children",
          required: false,
          where: { is_active: true },
        },
      ],
    });
  }

  static async getAllRoles(): Promise<string[]> {
    const roles = await HierarchyItem.findAll({
      where: {
        type: "ROLE",
        is_active: true,
      },
    });
    return roles.map((role) => role.code);
  }
}

HierarchyItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "hierarchy_items",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "hierarchy_items",
    timestamps: false,
    indexes: [
      { fields: ["type"] },
      { fields: ["code"], unique: true },
      { fields: ["parent_id"] },
    ],
  }
);

HierarchyItem.hasMany(HierarchyItem, {
  as: "children",
  foreignKey: "parent_id",
  sourceKey: "id",
});

HierarchyItem.belongsTo(HierarchyItem, {
  as: "parent",
  foreignKey: "parent_id",
  targetKey: "id",
});
