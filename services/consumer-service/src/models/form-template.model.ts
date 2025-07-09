import { Model, DataTypes, Optional } from 'sequelize';
import { BaseAttributes } from './base.model';
import sequelize from '../config/database';
import Utility from './utility.model';

interface FormTemplateAttributes extends BaseAttributes {
  formId: string;
  formName: string;
  utilityId: string;
  description?: string | null;
}

interface FormTemplateCreationAttributes extends Optional<FormTemplateAttributes, 'formId' | 'createdAt' | 'updatedAt'> {}

class FormTemplate extends Model<FormTemplateAttributes, FormTemplateCreationAttributes> 
  implements FormTemplateAttributes {
  public formId!: string;
  public formName!: string;
  public utilityId!: string;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FormTemplate.init(
  {
    formId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    formName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    utilityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Utility,
        key: 'utilityId',
      },
      onDelete: 'CASCADE',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'form_templates',
    timestamps: true,
    underscored: true,
  }
);

// Set up associations
FormTemplate.belongsTo(Utility, {
  foreignKey: 'utilityId',
  as: 'utility'
});

Utility.hasMany(FormTemplate, {
  foreignKey: 'utilityId',
  as: 'formTemplates'
});

export default FormTemplate;