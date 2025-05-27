import express from 'express';
import { createBillHandler  } from '../controllers/billing.controller';

const router = express.Router();

router.post('/bills', createBillHandler);

export default router;
