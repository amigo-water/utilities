import { HierarchyItem } from '../models/common.model'
import { Op } from 'sequelize';

export class CommonService {
    async create(data:any){
        return await HierarchyItem.create(data)
    }

    async getAll() {
        return await HierarchyItem.findAll({
            where: { is_active: true }
        })
    }

    async getById(id: number){
        return await HierarchyItem.findOne({
            where:{
                id,is_active:true
            }
        })
    }

    async update(id: number,updateData: any){
        const item = await HierarchyItem.findByPk(id);
        if(!item) return null;
        await item.update(updateData);
        return item
    }

    async delete(type: string, code: string){
        const item = await HierarchyItem.destroy({
            where:{
                type,
                code
            }
        });
        return item > 0;
    }

    async getAllTypes(type: string):Promise<string[]>{
        const results = await HierarchyItem.findAll({
            where:{
                type:{[Op.iLike]:type},
                is_active: true,
            },
            attributes:['code'],
            raw: true,
        })
        return results.map((item:any) => item.code);
    }
}