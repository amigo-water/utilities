import { Request, Response } from 'express';
import sequelize from '../config/database';
import FormTemplate from '../models/form-template.model';
import AttributeTemplate from '../models/attribute-template.model';
import FormAttribute from '../models/form-attribute.model';
import formBuilderService from '../services/form-builder.service';


class FormBuilderController {
  async createForm(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { utilityId } = req.params;
      const { formName, description } = req.body;

      const form = await FormTemplate.create({
        formName,
        utilityId,
        description
      }, { transaction });

      await transaction.commit();
      res.status(201).json(form);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: 'Failed to create form' });
    }
  }

  async listForms(req: Request, res: Response) {
    try {
      const { utilityId } = req.params;
      const forms = await FormTemplate.findAll({ 
        where: { utilityId },
        include: ['formAttributes']
      });
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forms' });
    }
  }

  async updateForm(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { formId } = req.params;
      const { formName, description } = req.body;

      const [updated] = await FormTemplate.update({
        formName,
        description
      }, {
        where: { formId },
        transaction
      });

      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Form not found' });
      }

      const updatedForm = await FormTemplate.findByPk(formId, { transaction });
      await transaction.commit();
      res.json(updatedForm);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: 'Failed to update form' });
    }
  }

  async deleteForm(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { formId } = req.params;
      
      // This will cascade delete form attributes due to the CASCADE constraint
      const deleted = await FormTemplate.destroy({
        where: { formId },
        transaction
      });

      if (!deleted) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Form not found' });
      }

      await transaction.commit();
      res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: 'Failed to delete form' });
    }
  }
  // Create a new attribute template
  async createAttributeTemplate(req: Request, res: Response) {
    try {
      const utilityId = req.params.utilityId;
      const { attributeName,datatype,applicableTo} = req.body;
      if (!attributeName || !datatype || !applicableTo || utilityId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: `attributeName`, `datatype`, `applicableTo` , `utilityId ',
        });
      }
      const template = await formBuilderService.createAttributeTemplate({
        ...req.body,
        utilityId,
      });

      return res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to create attribute template',
      });
    }
  }

  // Get all attribute templates for a utility
  async getAttributeTemplates(req: Request, res: Response) {
    try {
      const { utilityId } = req.params;
      const { applicableTo, search } = req.query;
      if (!utilityId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: utilityId',
        });
      }
      
      if (applicableTo && typeof applicableTo !== 'string') {
        return res.status(400).json({
          success: false,
          error: '`applicableTo` must be a string',
        });
      }

      if (search && typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          error: '`search` must be a string',
        });
      }
      const templates = await formBuilderService.getAttributeTemplates(utilityId, {
        applicableTo: applicableTo as string,
        search: search as string,
      });

      return res.json({
        success: true,
        data: templates,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch attribute templates',
      });
    }
  }

  // Update attribute template
  async updateAttributeTemplate(req: Request, res: Response) {
    try {
      const { templateId, utilityId } = req.params;
      const { attributeName,datatype,applicableTo} = req.body;
      if (!attributeName || !datatype || !applicableTo || utilityId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: `attributeName`, `datatype`, `applicableTo` , `utilityId ',
        });
      }
      const [rowsAffected, [updatedTemplate]] = await formBuilderService.updateAttributeTemplate(
        templateId,
        req.body,
        utilityId
      );

      if (rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute template not found or access denied',
        });
      }

      return res.json({
        success: true,
        data: updatedTemplate,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to update attribute template',
      });
    }
  }

  // Delete attribute template
  async deleteAttributeTemplate(req: Request, res: Response) {
    try {
      const { templateId, utilityId } = req.params;
      const rowsAffected = await formBuilderService.deleteAttributeTemplate(templateId, utilityId);

      if (rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute template not found or access denied',
        });
      }

      return res.json({
        success: true,
        message: 'Attribute template deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete attribute template',
      });
    }
  }
   
// Form attribute management
async addAttributeToForm(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { formId } = req.params;
    const { templateId, order = 0, isVisible = true, section = 'General' } = req.body;

    const formAttribute = await FormAttribute.create({
      formId,
      templateId,
      order,
      isVisible,
      section
    }, { transaction });

    await transaction.commit();
    res.status(201).json(formAttribute);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Failed to add attribute to form' });
  }
}

async getFormAttributes(req: Request, res: Response) {
  try {
    const { formId } = req.params;
    
    const formAttributes = await FormAttribute.findAll({
      where: { formId },
      include: [
        {
          model: AttributeTemplate,
          as: 'attributeTemplate',
          include: ['validationRules']
        }
      ],
      order: [['order', 'ASC']]
    });

    res.json(formAttributes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch form attributes' });
  }
}

async updateFormAttribute(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { formAttributeId } = req.params;
    const { order, isVisible, section } = req.body;

    const [updated] = await FormAttribute.update({
      order,
      isVisible,
      section
    }, {
      where: { formAttributeId },
      transaction
    });

    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Form attribute not found' });
    }

    const updatedAttribute = await FormAttribute.findByPk(formAttributeId, { transaction });
    await transaction.commit();
    res.json(updatedAttribute);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Failed to update form attribute' });
  }
}

async removeAttributeFromForm(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { formAttributeId } = req.params;
    
    const deleted = await FormAttribute.destroy({
      where: { formAttributeId },
      transaction
    });

    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Form attribute not found' });
    }

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Failed to remove attribute from form' });
  }
}
}

export default new FormBuilderController();