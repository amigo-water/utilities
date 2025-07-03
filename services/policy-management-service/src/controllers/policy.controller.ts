import { Request, Response } from 'express';
import {policyService} from '../services/policy.service';

export class PolicyController {
  public async createPolicy(req: Request, res: Response): Promise<Response> {
    try {
      const newPolicy = await policyService.createPolicyWithCategory(req.body);
      return res.status(201).json(newPolicy);
    } catch (error: any) {
      console.error('Create Policy Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
