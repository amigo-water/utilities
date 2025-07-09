import { v4 as uuidv4, validate as isUUID } from 'uuid';
import Utility from 'src/models/utility.model';
import {UtilityAttributes} from '../models/utility.model'

class UtilityService {
    async updateUtility (
        utilityId:string,
        updates:Partial<UtilityAttributes>
        ): Promise<Utility> {
        try{    
            let utility: Utility | null = null;

            if(utilityId && isUUID(utilityId)){
                utility = await Utility.findByPk(utilityId)
            }

            if(utility){
                // UPDATE flow
                await utility.update({
                    utilityName: updates.utilityName,
                    utilityCode: updates.utilityCode,
                    address: updates.address,
                    contactDetails: updates.contactDetails,
                    config: updates.config
                });
            } else {
                // CREATE flow
                const existingCode = await Utility.findOne({
                    where: { utilityCode: updates.utilityCode }
                });

                if (existingCode) {
                    throw new Error(`Utility with code "${updates.utilityCode}" already exists.`);
                }

                utility = await Utility.create({
                    utilityId: uuidv4(),
                    utilityName: updates.utilityName ?? '',
                    utilityCode: updates.utilityCode ?? '',
                    address: updates.address ?? {},
                    contactDetails: updates.contactDetails ?? {},
                    config: updates.config ?? {},
                });
            }

            return utility; 
        } catch(error:any){
            throw new Error(error.message || "Failed to update utility")
        }
    }

    async deleteUtility(utilityId:string): Promise<void>{
        try{
            const utility = await Utility.findByPk(utilityId);

            if(!utility){
                throw new Error("Utility not found")
            }

            await utility.destroy();

        } catch(error:any){
            throw new Error(error.message || "Failed to delete utility")
        }
    }

    // get all utilities
  async getAllUtilities(): Promise<Utility[]> {
    try {
      const utilities = await Utility.findAll({
        order: [["createdAt", "DESC"]],
      });

      return utilities;
    } catch (error) {
      console.error("Error fetching utilities: ", error);
      throw new Error("Failed to fetch utilities");
    }
  }

  // get utility by id
  async getUtilityById(utilityId: string): Promise<Utility> {
    try {
      const utility = await Utility.findByPk(utilityId);

      if (!utility) {
        throw new Error("Utility not found");
      }

      return utility;
    } catch (error) {
      console.error("Error fetching utility: ", error);
      throw new Error("Failed to fetch utility");
    }
  }
}


export default new UtilityService;