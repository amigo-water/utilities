import { v4 as uuidv4 } from 'uuid';
import Utility  from '../models/utility.model';
import AttributeTemplate, { AttributeTemplateAttributes } from '../models/attribute-template.model';
import { Op } from 'sequelize';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  validation?: Record<string, any>;
  options?: string[];
  description?: string;
}

class FormBuilderService {
  // Create a new attribute template
  async createAttributeTemplate(
    data: Omit<AttributeTemplateAttributes, 'templateId'>
  ): Promise<AttributeTemplate> {
    try {
      // Check if utility exists
      const utility = await Utility.findByPk(data.utilityId);
      if (!utility) {
        throw new Error('Utility not found');
      }

      // Check if attribute name already exists for this utility
      const existingAttribute = await AttributeTemplate.findOne({
        where: {
          utilityId: data.utilityId,
          attributeName: data.attributeName,
        },
      });

      if (existingAttribute) {
        throw new Error('Attribute with this name already exists for this utility');
      }

      const template = await AttributeTemplate.create({
        ...data,
        templateId: uuidv4(),
      });

      return template;
    } catch (error:any) {
      throw new Error(error.message || 'Failed to create attribute template');
    }
  }

  // Get all attribute templates for a utility
  async getAttributeTemplates(utilityId: string, filters: {
    applicableTo?: string;
    search?: string;
  } = {}): Promise<AttributeTemplate[]> {
    try {
      const where: any = { utilityId };

      if (!utilityId) {
        throw new Error('Utility ID is required');
      }

      if (filters.applicableTo) {
        where.applicableTo = filters.applicableTo;
      }

      if (filters.search) {
        where.attributeName = {
          [Op.iLike]: `%${filters.search}%`,
        };
      }

      return await AttributeTemplate.findAll({ where });
    } catch (error:any) {
      throw new Error(error.message || 'Failed to fetch attribute templates');
    }
  }

  // Update attribute template
  async updateAttributeTemplate(
    templateId: string,
    updates: Partial<Omit<AttributeTemplateAttributes, 'templateId' | 'utilityId'>>,
    utilityId: string
  ): Promise<[number, AttributeTemplate[]]> {
    try {
      // Check if the template belongs to the utility
      const template = await AttributeTemplate.findOne({
        where: { templateId, utilityId },
      });

      if (!template) {
        throw new Error('Attribute template not found or access denied');
      }

      // If updating attributeName, check for duplicates
      if (updates.attributeName) {
        const existing = await AttributeTemplate.findOne({
          where: {
            utilityId,
            attributeName: updates.attributeName,
            templateId: { [Op.ne]: templateId }, // Exclude current template
          },
        });

        if (existing) {
          throw new Error('Attribute with this name already exists for this utility');
        }
      }

      return await AttributeTemplate.update(updates, {
        where: { templateId },
        returning: true,
      });
    } catch (error:any) {
      throw new Error(error.message || 'Failed to update attribute template');
    }
  }

  // Delete attribute template
  async deleteAttributeTemplate(templateId: string, utilityId: string): Promise<number> {
    try {
      // Verify the template belongs to the utility
      const template = await AttributeTemplate.findOne({
        where: { templateId, utilityId },
      });

      if (!template) {
        throw new Error('Attribute template not found or access denied');
      }

      return await AttributeTemplate.destroy({
        where: { templateId },
      });
    } catch (error:any) {
      throw new Error(error.message || 'Failed to delete attribute template');
    }
  }

  // Generate form schema from attribute templates
  async generateFormSchema(utilityId: string, applicableTo: 'consumer' | 'connection'): Promise<{
    fields: FormField[];
  }> {
    try {
      const templates = await AttributeTemplate.findAll({
        where: {
          utilityId,
          applicableTo,
        },
        order: [['createdAt', 'ASC']],
      });

      const fields: FormField[] = templates.map((template) => {
        const field: FormField = {
          id: template.templateId,
          label: template.attributeName,
          type: template.datatype,
          required: template.isRequired,
          description: template.description,
        };

        if (template.defaultValue !== undefined) {
          field.defaultValue = template.defaultValue;
        }

        if (template.validationRules) {
          field.validation = { ...template.validationRules };
          
          // Handle options for select/multiselect
          if (['select', 'multiselect'].includes(template.datatype) && 
              template.validationRules.options) {
            field.options = template.validationRules.options;
          }
        }

        return field;
      });

      return { fields };
    } catch (error:any) {
      throw new Error(error.message || 'Failed to generate form schema');
    }
  }
}

export default new FormBuilderService();