import { Request, Response } from 'express';
import utilityService from '../services/utility.service';

class utilityController {
  async getAllUtilities(req: Request, res: Response) {
    try {
      const utilities = await utilityService.getAllUtilities();
      return res.status(200).json({
        success: true,
        message: "Successfully fetched utilities",
        data: utilities,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch utilities",
      });
    }
  }

  async getUtilityById(req: Request, res: Response) {
    try {
      const { utilityId } = req.params;

      const utility = await utilityService.getUtilityById(utilityId);
      if (!utility) {
        return res.status(404).json({
          success: false,
          message: `Utility not found with id: ${utilityId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "utility fetched successfully",
        data: utility,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch utility",
      });
    }
  }


    async updateUtility(req: Request, res: Response){
        try{
            const { utilityId } = req.params;
            console.log("UTILITYID",utilityId)
            if(!utilityId){
                return res.status(404).json({
                    success: false,
                    message:"Utility ID is required"
                })
            }

            const { utilityName, utilityCode, address, contactDetails,config} = req.body;

            const updatedUtility = await utilityService.updateUtility(utilityId,{
                utilityName,
                utilityCode,
                address,
                contactDetails,
                config
            })
 
            return res.status(200).json({
                success: true,
                message: utilityId ? 'Utility updated successfully' : 'Utility created successfully',
                data: updatedUtility,
            })
        } catch(error:any){
            return res.status(500).json({
                success: false,
                error: error.message || "Internal server error"
            })
        }  
    }

    async deleteUtility(req:Request,res:Response){
        try{
            const { utilityId } = req.params;

            if(!utilityId){
                return res.status(404).json({
                    success: false,
                    message:"Utility ID is required"
                })
            }
            await utilityService.deleteUtility(utilityId);

            return res.status(200).json({
                success: true,
                message: 'Utility deleted successfully'
            })
        } catch(error:any){
            return res.status(500).json({
                success: false,
                error: error.message || "Internal server error"
            })
        }
    }
}

export default new utilityController;