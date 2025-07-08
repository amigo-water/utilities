import { Request, Response } from 'express';
import formBuilderService from '../services/form-builder.service';

class FormBuilderController {
  // Create a new attribute template
  async createAttributeTemplate(req: Request, res: Response) {
    try {
      const utilityId = req.params.utilityId;
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

  // Get attribute template by ID
  async getAttributeTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const template = await formBuilderService.getAttributeTemplateById(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Attribute template not found',
        });
      }

      return res.json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch attribute template',
      });
    }
  }

  // Update attribute template
  async updateAttributeTemplate(req: Request, res: Response) {
    try {
      const { templateId, utilityId } = req.params;
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

  // Generate form schema
  async generateFormSchema(req: Request, res: Response) {
    try {
      const { utilityId } = req.params;
      const { type } = req.query;

      if (!type || (type !== 'consumer' && type !== 'connection')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing type parameter. Must be "consumer" or "connection"',
        });
      }

      const schema = await formBuilderService.generateFormSchema(
        utilityId,
        type as 'consumer' | 'connection'
      );

      return res.json({
        success: true,
        data: schema,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate form schema',
      });
    }
  }
}

export default new FormBuilderController();