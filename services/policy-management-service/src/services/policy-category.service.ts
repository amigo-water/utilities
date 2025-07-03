import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import PolicyCategory from '../models/policy-category.model';
import Policy from '../models/policy.model';
import PolicyVersion from '../models/policy-version.model';

interface CreateCategoryDTO {
  name: string;
  description?: string;
  utilityTypeId?: string;
}

interface CreatePolicyWithCategoryDTO {
  utilityTypeId: string;
  categoryName: string;
  categoryDescription?: string;
  policyName: string;
  policyDescription?: string;
  externalId?: string;
  effectiveFrom: Date;
  effectiveTo: Date;
  version: number;
  createdBy: string;
  approvedBy: string;
  metadata?: object;
}

export class PolicyCategoryService {
  async createCategory(data: CreateCategoryDTO) {
    const newCategory = await PolicyCategory.create({
      name: data.name,
      description: data.description || '',
      utility_type_id: data.utilityTypeId,
    });

    return newCategory;
  }

  async createPolicyWithCategory(data: CreatePolicyWithCategoryDTO) {
    const {
      utilityTypeId,
      categoryName,
      categoryDescription,
      policyName,
      policyDescription,
      externalId,
      effectiveFrom,
      effectiveTo,
      version,
      createdBy,
      approvedBy,
      metadata,
    } = data;

    const t = await sequelize.transaction();

    try {
      let category = await PolicyCategory.findOne({
        where: {
          name: categoryName,
          utility_type_id: utilityTypeId
        },
        transaction: t
      });

      if (!category) {
        category = await PolicyCategory.create(
          {
            name: categoryName,
            description: categoryDescription,
            utility_type_id: utilityTypeId,
          },
          { transaction: t }
        );
      }

      const policy = await Policy.create(
        {
          external_id: externalId,
          name: policyName,
          description: policyDescription,
          effective_from: effectiveFrom,
          effective_to: effectiveTo,
          version,
          status: 'Active',
          approval_status: 'Approved',
          category_id: category.id,
          utility_type_id: utilityTypeId,
          created_by: createdBy,
          approved_by: approvedBy,
          metadata
        },
        { transaction: t }
      );

      await PolicyVersion.create(
        {
          policy_id: policy.id,
          version,
          snapshot: {
            name: policyName,
            details: 'Initial version',
          },
          changed_by: createdBy,
          change_reason: 'Initial release',
        },
        { transaction: t }
      );

      await t.commit();

      return { policy, category };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export const policyCategoryService = new PolicyCategoryService();
