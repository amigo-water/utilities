import { Request, Response } from 'express';
import {policyCategoryService} from '../services/policy-category.service';

export class PolicyCategoryController {
  constructor() {}

  async createCategory(req: Request, res: Response) {
    try {
      const { name, utilityTypeId } = req.body;

      if (!name || !utilityTypeId) {
        return res.status(400).json({ error: 'Category name and utility type ID are required' });
      }

      const result = await policyCategoryService.createCategory(req.body);
      return res.status(201).json(result);
    } catch (error) {
      console.error('Create Category Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPolicyWithCategory(req: Request, res: Response) {
    try {
      const result = await policyCategoryService.createPolicyWithCategory(req.body);
      return res.status(201).json({ message: 'Policy created successfully', data: result });
    } catch (error) {
      console.error('Error creating policy:', error);
      return res.status(500).json({ message: 'Policy creation failed', error });
    }
  }
}
