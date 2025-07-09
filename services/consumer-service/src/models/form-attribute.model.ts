import { Model, DataTypes, Optional } from 'sequelize';
import { BaseAttributes } from './base.model';
import sequelize from '../config/database';
import FormTemplate from './form-template.model';
import AttributeTemplate from './attribute-template.model';

interface FormAttributeAttributes extends BaseAttributes {
  formAttributeId: string;
  formId: string;
  templateId: string;
  order: number;
  isVisible: boolean;
  section: string;
}

interface FormAttributeCreationAttributes 
  extends Optional<FormAttributeAttributes, 'formAttributeId' | 'createdAt' | 'updatedAt'> {}

class FormAttribute extends Model<FormAttributeAttributes, FormAttributeCreationAttributes> 
  implements FormAttributeAttributes {
  public formAttributeId!: string;
  public formId!: string;
  public templateId!: string;
  public order!: number;
  public isVisible!: boolean;
  public section!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FormAttribute.init(
  {
    formAttributeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    formId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FormTemplate,
        key: 'formId',
      },
      onDelete: 'CASCADE',
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AttributeTemplate,
        key: 'templateId',
      },
      onDelete: 'CASCADE',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    section: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'General',
    },
  },
  {
    sequelize,
    tableName: 'form_attributes',
    timestamps: true,
    underscored: true,
  }
);

// Set up associations
FormAttribute.belongsTo(FormTemplate, {
  foreignKey: 'formId',
  as: 'formTemplate'
});

FormTemplate.hasMany(FormAttribute, {
  foreignKey: 'formId',
  as: 'formAttributes'
});

FormAttribute.belongsTo(AttributeTemplate, {
  foreignKey: 'templateId',
  as: 'attributeTemplate'
});

AttributeTemplate.hasMany(FormAttribute, {
  foreignKey: 'templateId',
  as: 'formAttributes'
});

export default FormAttribute;