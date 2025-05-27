// import { Request, Response } from 'express';
// // import { calculateAndStoreBill } from '../services/billing.service';

// export const generateBill = async (req: Request, res: Response) => {
//     try {
//         const { consumerId, utilityId, categoryId, consumption } = req.body;

//         if (!consumerId || !utilityId || !categoryId || !consumption) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const bill = await calculateAndStoreBill(consumerId, utilityId, categoryId, consumption);
//         return res.status(201).json(bill);
//     } catch (error: any) {
//         return res.status(500).json({ error: error.message });
//     }
// };


import {Request, Response} from 'express';
import {calculateAndStoreBill} from '../services/billing.service';

export const createBillHandler = async(req: Request, res: Response)=>{
    try{
        const billData = req.body;
        const bill = await calculateAndStoreBill(billData);
        return res.status(201).json(bill);
    }catch(error){
        console.error('Error creating bill:', error);
        return res.status(500).json({ error: 'Failed to create bill' });
    }
}
