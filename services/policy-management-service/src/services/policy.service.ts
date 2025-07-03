// const { Op } = require('sequelize');
// const sequelize = require('../config/database');
// const { Policy, TariffPlan, TariffComponent } = require('../models');

// class PolicyService {
//   /**
//    * Create a new tariff policy with all its components
//    */
//   async createTariffPolicy(policyData) {
//     const { name, description, effectiveFrom, effectiveTo, status, tariffPlans, createdBy } = policyData;
    
//     if (!createdBy) {
//       throw new Error('createdBy field is required');
//     }
    
//     // Validate required fields
//     if (!name || !effectiveFrom || !status) {
//       throw new Error('Missing required fields: name, effectiveFrom, and status are required');
//     }
    
//     // Start a transaction
//     try {
//       return await sequelize.transaction(async (t) => {
//         // Create the policy
//         const policyData = {
//           id: require('uuid').v4(),
//           name,
//           description: description || null,
//           effective_from: new Date(effectiveFrom),
//           effective_to: effectiveTo ? new Date(effectiveTo) : null,
//           status,
//           version: 1,
//           created_by: createdBy
//         };
        
//         console.log('Creating policy with data:', JSON.stringify(policyData, null, 2));
        
//         const policy = await Policy.create(policyData, { 
//           transaction: t,
//           logging: console.log // Enable SQL query logging
//         });

//         // Create tariff plans and components
//         for (const planData of tariffPlans) {
//           await this._createTariffPlan(policy.id, planData, t);
//         }

//         return policy;
//       });
//     } catch (error) {
//       console.error('Error creating tariff policy:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create a tariff plan with all its components
//    * @private
//    */
//   async _createTariffPlan(policyId, planData, transaction) {
//     const { name, billingFrequency, currency, slabRates, minimumBills, pipeSizeRates, effectiveFrom, effectiveTo } = planData;
    
//     // Validate required fields
//     if (!name || !billingFrequency || !currency) {
//       throw new Error('Missing required fields: name, billingFrequency, and currency are required');
//     }
    
//     // Ensure dates are valid
//     const effectiveStart = effectiveFrom ? new Date(effectiveFrom) : new Date();
//     const effectiveEnd = effectiveTo ? new Date(effectiveTo) : null;
    
//     if (isNaN(effectiveStart.getTime())) {
//       throw new Error('Invalid effectiveFrom date');
//     }
    
//     if (effectiveEnd && isNaN(effectiveEnd.getTime())) {
//       throw new Error('Invalid effectiveTo date');
//     }
    
//     // Create tariff plan
//     const tariffPlan = await TariffPlan.create({
//       id: require('uuid').v4(),
//       policy_id: policyId,
//       name,
//       billing_frequency: billingFrequency,
//       currency,
//       effective_start: effectiveStart,
//       effective_end: effectiveEnd,
//       version_hash: Buffer.from(JSON.stringify(planData)),
//       is_default: false
//     }, { transaction });

//     // Create slab rate component
//     await TariffComponent.create({
//       id: require('uuid').v4(),
//       tariff_plan_id: tariffPlan.id,
//       component_type: 'VolumetricRate',
//       calculation_model: 'Stepped',
//       parameters: { slabRates },
//       precedence: 1,  
//       is_active: true
//     }, { transaction });

//     // Create minimum bill component if exists
//     if (minimumBills && minimumBills.length > 0) {
//       await TariffComponent.create({
//         id: require('uuid').v4(),
//         tariff_plan_id: tariffPlan.id,
//         component_type: 'FixedCharge',
//         calculation_model: 'Stepped',
//         parameters: { minimumBills },
//         precedence: 2,  
//         is_active: true
//       }, { transaction });
//     }

//     // Create pipe size rates component if exists
//     if (pipeSizeRates && pipeSizeRates.length > 0) {
//       await TariffComponent.create({
//         id: require('uuid').v4(),
//         tariff_plan_id: tariffPlan.id,
//         component_type: 'FixedCharge',
//         calculation_model: 'CapacityBased',
//         parameters: { pipeSizeRates },
//         precedence: 3,  
//         is_active: true
//       }, { transaction });
//     }

//     return tariffPlan;
//   }

//   /**
//    * Get tariff policy by ID with all its relations
//    */
//   async getTariffPolicyById(id) {
//     return await Policy.findByPk(id, {
//       include: [
//         {
//           model: TariffPlan,
//           as: 'TariffPlans',
//           include: [
//             {
//               model: TariffComponent,
//               as: 'TariffComponents'
//             }
//           ]
//         }
//       ]
//     });
//   }

//   /**
//    * Find tariff policies by date range and status
//    */
//   async findTariffPolicies({ date, startDate, endDate, status }) {
//     const where = {};
    
//     if (date) {
//       const queryDate = new Date(date);
//       where.effective_from = { [Op.lte]: queryDate };
//       where[Op.or] = [
//         { effective_to: null },
//         { effective_to: { [Op.gte]: queryDate } }
//       ];
//     } else if (startDate || endDate) {
//       if (startDate) where.effective_from = { [Op.gte]: new Date(startDate) };
//       if (endDate) where.effective_to = { [Op.lte]: new Date(endDate) };
//     }
    
//     if (status) where.status = status;
    
//     return await Policy.findAll({
//       where,
//       include: [
//         {
//           model: TariffPlan,
//           include: [
//             {
//               model: TariffComponent,
//               as: 'TariffComponents'
//             }
//           ]
//         }
//       ],
//       order: [['effective_from', 'DESC']]
//     });
//   }

//   /**
//    * Calculate water bill based on policy and consumption
//    */
//   async calculateWaterBill(policyId, { consumption, category, pipeSizeInInches, numberOfFlats = 1 }) {
//     // Find the policy with all its components
//     const policy = await this.getTariffPolicyById(policyId);
    
//     if (!policy) {
//       throw new Error('Policy not found');
//     }
    
//     // Get the tariff plan (simplified - in a real app, you might have multiple plans per policy)
//     const tariffPlan = policy.TariffPlans[0];
//     if (!tariffPlan) {
//       throw new Error('No tariff plan found for this policy');
//     }
    
//     // Find the relevant components
//     const slabRateComponent = tariffPlan.TariffComponents.find(
//       c => c.component_type === 'VolumetricRate'
//     );
    
//     const minimumBillComponent = tariffPlan.TariffComponents.find(
//       c => c.component_type === 'FixedCharge' && c.calculation_model === 'Stepped'
//     );
    
//     const pipeSizeComponent = tariffPlan.TariffComponents.find(
//       c => c.component_type === 'FixedCharge' && c.calculation_model === 'CapacityBased'
//     );
    
//     if (!slabRateComponent) {
//       throw new Error('No slab rate component found in tariff plan');
//     }
    
//     // Calculate consumption charge based on slab rates
//     const consumptionCharge = this._calculateConsumptionCharge(slabRateComponent.parameters.slabRates, consumption, category);
    
//     // Calculate minimum bill if applicable
//     const minimumBill = this._calculateMinimumBill(minimumBillComponent, category, numberOfFlats);
    
//     // Calculate pipe size based minimum bill if applicable
//     const pipeSizeBill = this._calculatePipeSizeBill(pipeSizeComponent, pipeSizeInInches);
    
//     // The final bill is the maximum of consumption charge, minimum bill, and pipe size bill
//     const totalBill = Math.max(consumptionCharge, minimumBill, pipeSizeBill);
    
//     return {
//       consumption,
//       consumptionCharge,
//       minimumBill,
//       pipeSizeBill,
//       totalBill,
//       currency: tariffPlan.currency,
//       category,
//       pipeSizeInInches,
//       numberOfFlats
//     };
//   }

//   /**
//    * Calculate consumption charge based on slab rates
//    * @private
//    */
//   _calculateConsumptionCharge(slabRates, consumption, category) {
//     let charge = 0;
//     let remainingConsumption = consumption;
    
//     // Sort slab rates by min consumption
//     const sortedSlabs = [...slabRates].sort((a, b) => a.min - b.min);
    
//     for (const slab of sortedSlabs) {
//       if (remainingConsumption <= 0) break;
      
//       const slabSize = slab.max 
//         ? Math.min(slab.max, remainingConsumption) - (slab.min - 1) 
//         : remainingConsumption;
      
//       const consumptionInSlab = Math.max(0, Math.min(slabSize, remainingConsumption));
      
//       // Get the rate for the current category or use the default rate
//       const rate = slab.rates[category] || slab.rates.default;
//       charge += consumptionInSlab * rate;
      
//       remainingConsumption -= consumptionInSlab;
//     }
    
//     return charge;
//   }

//   /**
//    * Calculate minimum bill based on category and number of flats
//    * @private
//    */
//   _calculateMinimumBill(minimumBillComponent, category, numberOfFlats) {
//     if (!minimumBillComponent || !minimumBillComponent.parameters.minimumBills) {
//       return 0;
//     }
    
//     const applicableMinimumBill = minimumBillComponent.parameters.minimumBills.find(
//       mb => mb.category === category || mb.category === 'default'
//     );
    
//     if (!applicableMinimumBill) {
//       return 0;
//     }
    
//     let minimumBill = applicableMinimumBill.amount;
    
//     // For MSB with multiple flats, multiply minimum bill by number of flats
//     if (category === 'MSB' && numberOfFlats > 1) {
//       minimumBill *= numberOfFlats;
//     }
    
//     return minimumBill;
//   }

//   /**
//    * Calculate pipe size based minimum bill
//    * @private
//    */
//   _calculatePipeSizeBill(pipeSizeComponent, pipeSizeInInches) {
//     if (!pipeSizeComponent || pipeSizeInInches === undefined) {
//       return 0;
//     }
    
//     const applicablePipeRate = pipeSizeComponent.parameters.pipeSizeRates.find(
//       rate => pipeSizeInInches >= rate.minInches && pipeSizeInInches <= (rate.maxInches || Infinity)
//     );
    
//     return applicablePipeRate ? applicablePipeRate.amount : 0;
//   }
// }

// module.exports = new PolicyService();



import { v4 as uuidv4 } from 'uuid';
import Policy from '../models/policy.model';
import PolicyCategory from '../models/policy-category.model';

interface CreatePolicyWithCategoryDTO {
  name: string;
  version: string;
  status: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  description?: string;
  externalId?: string;
  approvalStatus?: string;
  categoryId: string;
  utilityTypeId?: string;
  createdBy: string;
  approvedBy?: string;
  metadata?: Record<string, any>;
}

export class PolicyService {
  async createPolicyWithCategory(data: CreatePolicyWithCategoryDTO) {
    const policyCategory = await PolicyCategory.findByPk(data.categoryId);
    if (!policyCategory) {
      throw new Error('Invalid categoryId: category does not exist');
    }

const policy = await Policy.create({
  external_id: data.externalId ?? undefined,
  name: data.name,
  description: data.description ?? undefined,
  effective_from: data.effectiveFrom,
  effective_to: data.effectiveTo ?? undefined,
  version: parseFloat(data.version),
  status: data.status as 'Draft' | 'Active' | 'Inactive' | 'Archived',
  approval_status: (data.approvalStatus ?? 'Pending') as 'Pending' | 'Approved' | 'Rejected',
  category_id: data.categoryId ?? undefined,
  utility_type_id: data.utilityTypeId ?? undefined,
  created_by: data.createdBy,
  approved_by: data.approvedBy ?? undefined,
  metadata: data.metadata ?? {}
});
    return policy;
  }
}

export const policyService = new PolicyService();
