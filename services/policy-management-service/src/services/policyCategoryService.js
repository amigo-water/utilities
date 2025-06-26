const PolicyCategory = require('../models/PolicyCategory');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database'); 
const Policy = require('../models/Policy');
const PolicyVersion = require('../models/PolicyVersion');

exports.createCategory = async (data) => {
  const newCategory = await PolicyCategory.create({
    id: uuidv4(),
    name: data.name,
    description: data.description || '',
    utilityTypeId: data.utilityTypeId || null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return newCategory;
};



exports.createPolicyWithCategory = async (data) => {
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
    // Check or create category
    let category = await PolicyCategory.findOne({
      where: { name: categoryName, utility_type_id: utilityTypeId },
      transaction: t,
    });

    if (!category) {
      category = await PolicyCategory.create(
        {
          id: uuidv4(),
          name: categoryName,
          description: categoryDescription,
          utility_type_id: utilityTypeId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );
    }

    const policyId = uuidv4();

    const policy = await Policy.create(
      { 
        id: policyId,
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
        metadata,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await PolicyVersion.create(
      {
        id: uuidv4(),
        policy_id: policyId,
        version,
        snapshot: {
          name: policyName,
          details: 'Initial version',
        },
        created_at: new Date(),
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
};


