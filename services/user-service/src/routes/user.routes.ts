import express, { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken, requireAdmin, requireSuperAdmin } from '@shared/middleware/auth.middleware';
const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', (req: Request, res: Response) => userController.register(req, res));
router.post('/login', (req: Request, res: Response) => userController.login(req, res));
router.post('/request-otp', (req: Request, res: Response) => userController.requestOTP(req, res));
router.post('/verify-otp', (req: Request, res: Response) => userController.verifyOTP(req, res));

// Protected routes (require authentication)
router.get('/profile', verifyToken, (req: Request, res: Response, ) => userController.getProfile(req, res));
router.put('/profile', verifyToken, (req: Request, res: Response) => userController.updateProfile(req, res));
router.put('/password', verifyToken, (req: Request, res: Response) => userController.updatePassword(req, res));
router.post('/logout', verifyToken, (req: Request, res: Response) => userController.logout(req, res));


router.post('/create-users',userController.createUser);
router.post('/common-details',userController.createCommonDetails); 
router.get('/roles-details',userController.getAllRolesDetails); 
router.get('/roles/types',verifyToken,userController.getRoleTypes) 
router.delete('/common-details',userController.deleteCommonDetail);

export default router;