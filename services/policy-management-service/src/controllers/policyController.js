// const { Op } = require('sequelize');
// const { sequelize } = require('../config/database');
// const { Policy, TariffPlan, TariffComponent } = require('../models');
// const { v4: uuidv4 } = require('uuid');
// const policyService = require('../services/policyService');

// /**
//  * Create a new tariff policy
//  */
// exports.createTariffPolicy = async (req, res, next) => {
//   try {
//     // In a real app, get the user ID from the authenticated user's token/session
//     // For now, we'll generate a random UUID for testing
//     const createdBy = req.user?.id || uuidv4();
    
//     const policy = await policyService.createTariffPolicy({
//       ...req.body,
//       createdBy
//     });
    
//     // Fetch the created policy with all its relations
//     const createdPolicy = await policyService.getTariffPolicyById(policy.id);
    
//     res.status(201).json({
//       success: true,
//       data: createdPolicy
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get tariff policy by ID
//  */
// exports.getTariffPolicy = async (req, res, next) => {
//   try {
//     const policy = await policyService.getTariffPolicyById(req.params.id);
    
//     if (!policy) {
//       return res.status(404).json({
//         success: false,
//         message: 'Policy not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: policy
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get tariff policies by date range
//  */
// exports.getTariffPolicies = async (req, res, next) => {
//   try {
//     const { date, startDate, endDate, status } = req.query;
//     const policies = await policyService.findTariffPolicies({
//       date,
//       startDate,
//       endDate,
//       status
//     });
    
//     res.status(200).json({
//       success: true,
//       count: policies.length,
//       data: policies
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Update tariff policy
//  */
// exports.updateTariffPolicy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
    
//     // Convert date strings to Date objects if they exist
//     if (updateData.effectiveFrom) updateData.effective_from = new Date(updateData.effectiveFrom);
//     if (updateData.effectiveTo) updateData.effective_to = new Date(updateData.effectiveTo);
    
//     // Remove the original fields to avoid Sequelize errors
//     delete updateData.effectiveFrom;
//     delete updateData.effectiveTo;
    
//     const [updated] = await Policy.update(updateData, {
//       where: { id },
//       returning: true,
//       plain: true
//     });
    
//     if (!updated) {
//       return res.status(404).json({
//         success: false,
//         message: 'Policy not found'
//       });
//     }
    
//     // If tariff plans are being updated
//     if (req.body.tariffPlans) {
//       // This is a simplified update - in a real app, you'd want to handle updates more carefully
//       await TariffPlan.destroy({ where: { policy_id: id } });
      
//       for (const planData of req.body.tariffPlans) {
//         await policyService._createTariffPlan(id, planData);
//       }
//     }
    
//     // Fetch the updated policy with relations
//     const updatedPolicy = await policyService.getTariffPolicyById(id);
    
//     res.status(200).json({
//       success: true,
//       data: updatedPolicy
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Delete tariff policy
//  */
// exports.deleteTariffPolicy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
    
//     const deleted = await Policy.destroy({
//       where: { id }
//     });
    
//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: 'Policy not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Policy deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Calculate water bill based on policy and consumption
//  */
// exports.calculateWaterBill = async (req, res, next) => {
//   try {
//     const { policyId, consumption, category, pipeSizeInInches, numberOfFlats } = req.body;
    
//     const result = await policyService.calculateWaterBill(policyId, {
//       consumption,
//       category,
//       pipeSizeInInches,
//       numberOfFlats
//     });
    
//     res.status(200).json({
//       success: true,
//       data: result
//     });
//   } catch (error) {
//     next(error);
//   }
// };



const policyService = require('../services/policyService');

exports.createPolicy = async (req, res) => {
  try {
    const newPolicy = await policyService.createPolicy(req.body);
    res.status(201).json(newPolicy);
  } catch (error) {
    console.error('Create Policy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
