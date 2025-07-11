import { Request, Response } from "express";
import { Op } from "sequelize";
import Consumer from "../models/consumer.model";
import Connection from "../models/connection.model";
import ConsumerCategory from "../models/consumer-category.model";
import OrganizationUnit from "../models/organization-unit.model";

interface UpdateConsumerProfileBody {
  consumerNumber: string;
  name?: string;
  status?: string;
}

interface UpdateConsumerContactBody {
  consumerNumber: string;
  mobile?: string;
  email?: string;
  address?: string;
}

export class ConsumerSearchController {
  public async searchConsumers(req: Request, res: Response) {
    try {
      const { can, mobile, name } = {
        ...req.query,
        ...req.body,
      };

      if (!can && !mobile && !name) {
        return res.status(400).json({
          success: false,
          message:
            "At least one search parameter (can, mobile, or name) is required",
        });
      }

      // Build search conditions
      const whereClause: any = {};

      if (can) {
        whereClause.consumerNumber = can;
      }

      if (mobile) {
        // Remove any non-digit characters and handle country code
        const cleanMobile = String(mobile).replace(/\D/g, "");
        whereClause.mobileNumber = {
          [Op.or]: [
            { [Op.eq]: cleanMobile },
            { [Op.eq]: cleanMobile.replace(/^\d{2}/, "") }, // Handle country code
          ],
        };
      }

      if (name && typeof name === "string" && name.length >= 3) {
        whereClause.name = {
          [Op.iLike]: `%${name}%`,
        };
      }

      const consumers = await Consumer.findAll({
        where: whereClause,
        include: [
          {
            model: Connection,
            as: "connections",
            attributes: [
              "connectionId",
              "connectionType",
              "status",
              "pipeSize",
              "connectionNumber",
            ],
          },
          {
            model: ConsumerCategory,
            as: "category",
            attributes: ["categoryId", "categoryName", "shortCode"],
          },
          {
            model: OrganizationUnit,
            as: "organizationUnit",
            attributes: ["unitId", "name", "code", "type"],
          },
        ],
        limit: 50, // Limit results to prevent performance issues
        order: [["createdAt", "DESC"]],
      });

      if (!consumers || consumers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No consumers found matching the search criteria",
        });
      }

      return res.status(200).json({
        success: true,
        data: consumers,
        count: consumers.length,
      });
    } catch (error) {
      console.error("Error searching consumers:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to search consumers",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public async getConsumerDetails(req: Request, res: Response) {
    try {
      const { consumerNumber } = req.query;

      if (!consumerNumber || typeof consumerNumber !== "string") {
        return res.status(400).json({
          success: false,
          message: "Consumer number is required in query params",
        });
      }

      // Define the include type
      type ConsumerWithConnections = Consumer & {
        connections: Connection[];
      };

      const consumer = (await Consumer.findOne({
        where: { consumerNumber },
        attributes: [
          "name",
          "consumerNumber",
          "status",
          "email",
          "mobileNumber",
          "address",
        ],
        include: [
          {
            model: Connection,
            as: "connections",
            attributes: [
              "connectionId",
              "connectionType",
              "status",
              "pipeSize",
              "connectionNumber",
              "serviceStartDate",
            ],
          },
        ],
      })) as unknown as ConsumerWithConnections | null;

      if (!consumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      const response = {
        name: consumer.name,
        status: consumer.status || "Inactive",
        consumerId: consumer.consumerNumber,
        email: consumer.email || "N/A",
        phone: consumer.mobileNumber || "N/A",
        address: consumer.address
          ? `${consumer.address.line1 || ""} ${consumer.address.line2 || ""}, ${
              consumer.address.city || ""
            }, ${consumer.address.state || ""} ${
              consumer.address.pincode || ""
            }`.trim()
          : "N/A",
        connections: consumer.connections || [],
      };

      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Error fetching consumer details:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch consumer details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get consumer connections
  public async getConsumerConnections(req: Request, res: Response) {
    try {
      const { consumerId } = req.params;

      if (!consumerId) {
        return res.status(400).json({
          success: false,
          message: "Consumer ID is required",
        });
      }

      const connections = await Connection.findAll({
        where: { consumerId },
        include: [
          {
            model: OrganizationUnit,
            as: "organizationUnit",
            attributes: ["unitId", "name", "code", "type"],
          },
        ],
      });

      return res.json({
        success: true,
        data: connections,
        count: connections.length,
      });
    } catch (error) {
      console.error("Error fetching consumer connections:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch consumer connections",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public async updateConsumerProfile(req: Request, res: Response) {
    try {
      const { consumerNumber, name, status } =
        req.body as UpdateConsumerProfileBody;

      if (!consumerNumber) {
        return res.status(400).json({
          success: false,
          message: "consumerNumber is required to update the consumer profile",
        });
      }

      const consumer = await Consumer.findOne({
        where: { consumerNumber },
      });

      if (!consumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      // Update the fields only if provided
      if (name) consumer.name = name;
      if (status) consumer.status = status;

      await consumer.save();

      return res.status(200).json({
        success: true,
        message: "Consumer profile updated successfully",
        data: consumer,
      });
    } catch (error) {
      console.error("Error updating consumer profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update consumer profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public async updateConsumerContact(req: Request, res: Response) {
    try {
      const { consumerNumber, mobile, email, address } =
        req.body as UpdateConsumerContactBody;

      if (!consumerNumber) {
        return res.status(400).json({
          success: false,
          message: "consumerNumber is required to update the consumer contact",
        });
      }

      const consumer = await Consumer.findOne({
        where: { consumerNumber },
      });

      if (!consumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      // Update the fields only if provided
      if (mobile) consumer.mobileNumber = mobile;
      if (email) consumer.email = email;
      if (address && typeof address === "object") {
        consumer.address = address;
      }

      await consumer.save();

      return res.status(200).json({
        success: true,
        message: "Consumer contact updated successfully",
        data: consumer,
      });
    } catch (error) {
      console.error("Error updating consumer contact:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update consumer contact",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
