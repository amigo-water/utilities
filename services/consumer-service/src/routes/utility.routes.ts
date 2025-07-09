import { Router } from "express";
import utilityController from "../controllers/utility.controller";
import {
  verifyToken,
  requireSuperAdmin,
} from "@shared/middleware/auth.middleware";

const router = Router({ mergeParams: true });


router.get("/utility",verifyToken,requireSuperAdmin, utilityController.getAllUtilities);
router.get("/utility/:utilityId",verifyToken,requireSuperAdmin, utilityController.getUtilityById);
router.put('/:utilityId', utilityController.updateUtility);
router.delete('/:utilityId',utilityController.deleteUtility);

export default router;


