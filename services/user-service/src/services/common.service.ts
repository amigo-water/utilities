import { HierarchyItem } from "../models/common.model";
import { Op, Sequelize } from "sequelize";
import { IHierarchyItem } from "../models/common.model";

export class CommonService {
    async create(data: Partial<IHierarchyItem>) {
        try {
          if (!data.code || !data.type || !data.name) {
            throw new Error("Missing required fields: 'type', 'code', or 'name'");
          }
    
          // Check if code already exists for the type
          const exists = await HierarchyItem.findOne({
            where: { type: data.type, code: data.code },
          });
          if (exists)
            throw new Error(
              `Code '${data.code}' already exists for type '${data.type}'`
            );
    
          let metadata = {};
          if (data.type.includes("role")) {
            if (data.code === "staff") {
              metadata = { visibleTo: ["admin", "superadmin"] };
            } else if (data.code === "admin") {
              metadata = { visibleTo: ["superadmin"] };
            } else if (data.code === "superadmin") {
              metadata = { visibleTo: [] };
            } else {
              metadata = { visibleTo: [] };
            }
          }
    
          const payload = {
            type: data.type,
            code: data.code,
            name: data.name,
            description: data.description,
            parent_id: data.parent_id,
            metadata,
            is_active: data.is_active !== false,
          };
    
          return await HierarchyItem.create(payload as any);
        } catch (error: any) {
          throw new Error(error.message || "Failed to create common detail");
        }
      }
  async getAll() {
    try {
      return await HierarchyItem.findAll({
        where: { is_active: true },
        raw: true,
      });
    } catch (error) {
      throw new Error("Failed to fetch common details");
    }
  }

  async getById(id: number) {
    try {
      return await HierarchyItem.findOne({
        where: {
          id,
          is_active: true,
        },
        raw: true,
      });
    } catch (error) {
      throw new Error(`Failed to fetch item with id ${id}`);
    }
  }

  async delete(type: string, code: string) {
    try {
      const count = await HierarchyItem.destroy({
        where: {
          type: type.toLowerCase(),
          code: code.toLowerCase(),
        },
      });
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete item with type '${type}' and code '${code}'`
      );
    }
  }

  async getAllTypes(type: string): Promise<string[]> {
    try {
      const results = await HierarchyItem.findAll({
        where: {
          type: { [Op.iLike]: type },
          is_active: true,
        },
        attributes: ["code"],
        raw: true,
      });

      return results.map((item: any) => item.code);
    } catch (error) {
      throw new Error(`Failed to get types for '${type}'`);
    }
  }

  async getNamesByType(type: string) {
    try {
      if (type !== "type" && type !== "code") {
        throw new Error(
          'Invalid nameTypes parameter: must be "type" or "code"'
        );
      }

      const records = await HierarchyItem.findAll({
        where: {
          is_active: true,
        },
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(type)), "value"]],
      });

      return records.map((r: any) => r.getDataValue("value"));
    } catch (error: any) {
      throw new Error(error.message || "Unknown database error");
    }
  }
}
