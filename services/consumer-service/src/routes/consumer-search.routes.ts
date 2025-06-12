import { Router } from "express";
import { ConsumerSearchController } from "../controllers/consumer-search.controller";

const router = Router();
const consumerSearchController = new ConsumerSearchController();

/**
 * @route   GET /api/consumers/search
 * @desc    Search consumers by CAN, mobile number, or name
 * @access  Public
 * @query   {string} [can] - Consumer Account Number (exact match)
 * @query   {string} [mobile] - Mobile number (with or without country code)
 * @query   {string} [name] - Consumer name (partial match, minimum 3 characters)
 */
router.get(
  "/search",
  consumerSearchController.searchConsumers.bind(consumerSearchController)
);

/**
 * @route   GET /api/consumers/:consumerNumber
 * @desc    Get consumer details by ID
 * @access  Public
 * @param   {string} consumerNumber - Consumer Number (UUID)
 */
router.get(
  "/consumerNumber",
  consumerSearchController.getConsumerDetails.bind(consumerSearchController)
);

/**
 * @route   GET /api/consumers/:consumerId/connections
 * @desc    Get all connections for a consumer
 * @access  Public
 * @param   {string} consumerId - Consumer ID (UUID)
 */
router.get(
  "/:consumerId/connections",
  consumerSearchController.getConsumerConnections.bind(consumerSearchController)
);

export default router;
