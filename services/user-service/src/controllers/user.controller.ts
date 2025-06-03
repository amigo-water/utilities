import { Request, Response } from "express";
import { User, UserRole, IUser, LoginHistory } from "../models/user.model";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import twilio from "twilio";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { KafkaService } from '../services/kafka.service';
import { messagingService } from '../services/messaging.service';


// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface OTPRequest {
  otp: string;
  identifier: string;
  type: "email" | "phone" | "username";
}

interface LoginRequest {
  identifier: string;
  password: string;
  type: "email" | "phone" | "username";
}

export class UserController {
  public readonly JWT_SECRET: string = process.env.JWT_SECRET || "";
  public readonly JWT_EXPIRES_IN: string = "24h";
  public readonly OTP_EXPIRES_IN: number =
    Number(process.env.OTP_EXPIRES_IN) || 5 * 60 * 1000; // 5 minutes
  public readonly OTP_LENGTH: number = Number(process.env.OTP_LENGTH) || 6;

  private readonly otpCache: Map<string, { otp: string; expiresAt: number }> = new Map();

  private readonly transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  private readonly twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  private kafkaService: KafkaService;

  constructor() {
    this.kafkaService = KafkaService.getInstance();
    // Bind methods to ensure proper 'this' context
    this.generateOTP = this.generateOTP.bind(this);
    this.storeOTP = this.storeOTP.bind(this);
    this.sendOTPEmail = this.sendOTPEmail.bind(this);
    this.sendOTPPhone = this.sendOTPPhone.bind(this);
    this.validateOTP = this.validateOTP.bind(this);
  }

  private generateOTP(): string {
    console.log("Generating OTP");
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private storeOTP(identifier: string, otp: string): void {
    console.log("Storing OTP for identifier:", identifier);
    this.otpCache.set(identifier, {
      otp,
      expiresAt: Date.now() + Number(process.env.OTP_EXPIRES_IN),
    });
    console.log("OTP stored successfully");
  }

  private async sendOTPEmail(email: string, otp: string): Promise<void> {
    console.log("Sending OTP email to:", email);
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verification OTP",
      text: `Your verification OTP is: ${otp}. This OTP will expire in 5 minutes.`,
    });
  }

  private async sendOTPPhone(phone: string, otp: string): Promise<void> {
    await messagingService.sendOTP(phone, otp, 'whatsapp');
    await messagingService.sendOTP(phone, otp, 'sms');
  }

  private async validateOTP(identifier: string, otp: string): Promise<boolean> {
    const otpData = this.otpCache.get(identifier);
    if (!otpData) return false;

    if (otpData.expiresAt < Date.now()) {
      this.otpCache.delete(identifier);
      return false;
    }

    if (otpData.otp === otp) {
      this.otpCache.delete(identifier);
      return true;
    }

    return false;
  }

  async requestOTP(req: Request, res: Response) {
    try {
      const { identifier, type } = req.body as {
        identifier: string;
        type: "email" | "phone";
      };

      console.log("Received OTP request:", { identifier, type });

      if (!identifier || !type) {
        console.error("Missing required fields");
        return res
          .status(400)
          .json({ message: "Identifier and type are required" });
      }

      // Validate email format if type is email
      if (type === "email" && !identifier.includes("@")) {
        console.error("Invalid email format");
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate phone number format if type is phone
      if (type === "phone" && !/^[+]?[0-9]{10,}$/.test(identifier)) {
        console.error("Invalid phone number format");
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      const otp = this.generateOTP();
      console.log("Generated OTP:", otp);

      // Store OTP with identifier
      this.storeOTP(identifier, otp);
      console.log("OTP stored successfully for identifier:", identifier);

      // Send OTP based on type
      switch (type) {
        case "email":
          console.log("Sending OTP email to:", identifier);
          await this.sendOTPEmail(identifier, otp);
          break;
        case "phone":
          console.log("Sending OTP SMS to:", identifier);
          await this.sendOTPPhone(identifier, otp);
          break;
        default:
          console.error("Invalid type received:", type);
          return res.status(400).json({ message: "Invalid type" });
      }

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error in requestOTP:", error);
      res.status(500).json({ 
        message: "Error sending OTP", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { identifier, otp } = req.body as {
        identifier: string;
        otp: string;
      };

      if (!identifier || !otp) {
        return res
          .status(400)
          .json({ message: "Identifier and OTP are required" });
      }

      const isValid = await this.validateOTP(identifier, otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { username, name, role, utility_id, contact_info, password } =
        req.body;

      // Validate contact info
      if (!contact_info?.email && !contact_info?.phone) {
        return res
          .status(400)
          .json({
            message: "At least one contact method (email or phone) is required",
          });
      }

      // Check if username already exists
      const existingUser = await User.findOne({
        where: {
          username,
        },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        user_id: uuidv4(),
        username,
        name,
        role,
        login_url: "",
        utility_id,
        contact_info,
        status: "active",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create user role
      await UserRole.create({
        user_id: user.user_id,
        role_name: role,
      });

      // Generate JWT token
      // const token = jwt.sign(
      //   { user_id: user.user_id },
      //   jwtService.getSecret(),
      //   { expiresIn: this.JWT_EXPIRES_IN }
      // );
      await this.kafkaService.publish('user.created', {
        userId: user.user_id,
        email: user.contact_info.email,
        name: user.name,
        createdAt: new Date().toISOString(),
        eventType: 'user.created',
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          user_id: user.user_id,
          username: user.username,
          name: user.name,
          role: user.role,
          utility_id: user.utility_id,
          contact_info: user.contact_info,
          status: user.status,
          created_at: user.created_at,
        },
        // token,
      });
    } catch (error) {
      console.error("Registration error:", error); // Add this line to see the actual error
      res.status(500).json({
        message: "Error registering user",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { identifier, password, type } = req.body as LoginRequest;

      if (!identifier || !password || !type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let user: IUser | null = null;

      // Find user based on identifier type
      switch (type) {
        case "email":
          user = await User.findOne({
            where: {
              "contact_info.email": identifier,
            },
          });
          break;
        case "phone":
          user = await User.findOne({
            where: {
              "contact_info.phone": identifier,
            },
          });
          break;
        case "username":
          user = await User.findOne({
            where: {
              username: identifier,
            },
          });
          break;
        default:
          return res.status(400).json({ message: "Invalid type" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For phone and username login, proceed directly
      const ipAddress =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        (req as Express.Request & { socket: { remoteAddress: string } }).socket
          ?.remoteAddress ||
        "unknown";

      // Create login history record
      await LoginHistory.create({
        user_id: user.user_id,
        ip_address: ipAddress,
        user_agent: req.headers["user-agent"] || "unknown",
        login_at: new Date(),
        success: true,
      });

      console.log("==OTP11111111111==")
      // Generate OTP for email-based login
      if (type === "email") {
        console.log("Generating OTP for email-based login");
        const otp = this.generateOTP();
        console.log("Generated OTP:", otp);
        this.storeOTP(identifier, otp);
        await this.sendOTPEmail(identifier, otp);
        
        return res.status(200).json({
          message: "OTP sent successfully",
          user: {
            user_id: user.user_id,
            username: user.username,
            name: user.name,
            role: user.role,
            utility_id: user.utility_id,
            contact_info: user.contact_info,
            status: user.status,
            created_at: user.createdAt,
          }
        });
      }else if(type === "phone"){
        console.log("Generating OTP for phone-based login");
        const otp = this.generateOTP();
        console.log("Generated OTP:", otp);
        this.storeOTP(identifier, otp);
        await this.sendOTPPhone(identifier, otp);
        
        return res.status(200).json({
          message: "OTP sent successfully",
          user: {
            user_id: user.user_id,
            username: user.username,
            name: user.name,
            role: user.role,
            utility_id: user.utility_id,
            contact_info: user.contact_info,
            status: user.status,
            created_at: user.createdAt,
          }
        });

      }

      

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        user: {
          user_id: user.user_id,
          username: user.username,
          name: user.name,
          role: user.role,
          utility_id: user.utility_id,
          contact_info: user.contact_info,
          status: user.status,
          created_at: user.createdAt,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error during login", error: error });
    }
  }

  async verifyLoginOTP(req: Request, res: Response) {
    try {
      const { identifier, otp } = req.body as {
        identifier: string;
        otp: string;
      };

      if (!identifier || !otp) {
        return res.status(400).json({ message: "Identifier and OTP are required" });
      }

      const isValid = await this.validateOTP(identifier, otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Find user by email
      const user = await User.findOne({
        where: {
          "contact_info.email": identifier,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get client IP address
      const ipAddress =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        (req as Express.Request & { socket: { remoteAddress: string } }).socket
          ?.remoteAddress ||
        "unknown";

      // Create login history record
      await LoginHistory.create({
        user_id: user.user_id,
        ip_address: ipAddress,
        user_agent: req.headers["user-agent"] || "unknown",
        login_at: new Date(),
        success: true,
      });

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        user: {
          user_id: user.user_id,
          username: user.username,
          name: user.name,
          role: user.role,
          utility_id: user.utility_id,
          contact_info: user.contact_info,
          status: user.status,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error: error });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Clear the authorization header
      delete req.headers.authorization;

      // Optionally, you could also clear the token from the client's cookie if you're using cookies
      res.clearCookie('token');

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Error during logout", error });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userRoles = await UserRole.find({ user_id: userId });

      res.json({
        user: {
          user_id: user?.user_id,
          username: user?.username,
          name: user?.name,
          role: user?.role,
          utility_id: user?.utility_id,
          contact_info: user?.contact_info,
          status: user?.status,
          created_at: user?.createdAt,
          updated_at: user?.updatedAt,
          roles: userRoles.map((role: any) => ({
            role_name: role.role_name,
            assigned_at: role.assigned_at,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile", error });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, contact_info, status } = req.body;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Update user profile and get the updated user
      const [updatedCount, [updatedUser]] = await User.update(
        { name, contact_info, status },
        {
          where: { user_id: userId },
          returning: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await this.kafkaService.publish('user.updated', {
        userId: updatedUser.user_id,
        name: updatedUser.name,
        contact_info: updatedUser.contact_info,
        status: updatedUser.status,
        updatedAt: updatedUser.updated_at,
        eventType: 'user.updated',
      });

      res.json({
        message: "Profile updated successfully",
        user: {
          user_id: updatedUser?.user_id,
          username: updatedUser?.username,
          name: updatedUser?.name,
          role: updatedUser?.role,
          utility_id: updatedUser?.utility_id,
          contact_info: updatedUser?.contact_info,
          status: updatedUser?.status,
          created_at: updatedUser?.created_at,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid current password" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.update(
        { password: hashedPassword },
        { where: { user_id: userId } }
      );

      await this.kafkaService.publish('user.password.updated', {
        userId,
        eventType: 'user.password.updated',
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password", error });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { userId, roleName } = req.body;

      if (!userId || !roleName) {
        return res
          .status(400)
          .json({ message: "User ID and role name are required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if role already exists for this user
      const existingRole = await UserRole.findOne({
        where: {
          user_id: userId,
          role_name: roleName,
        },
      });

      if (existingRole) {
        return res
          .status(400)
          .json({ message: "Role already exists for this user" });
      }

      const role = await UserRole.create({
        user_id: userId,
        role_name: roleName,
      });

      await this.kafkaService.publish('role.created', {
        userId,
        role_name: roleName,
        eventType: 'role.created',
      });

      res.status(201).json({
        message: "Role created successfully",
        role: {
          id: role.id,
          user_id: role.user_id,
          role_name: role.role_name,
          assigned_at: role.assigned_at,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating role", error });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { roleId, roleName } = req.body;

      if (!roleId || !roleName) {
        return res
          .status(400)
          .json({ message: "Role ID and role name are required" });
      }

      const role = await UserRole.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      await role.update({
        role_name: roleName,
      });

      await this.kafkaService.publish('role.updated', {
        userId: role.user_id,
        role_name: roleName,
        eventType: 'role.updated',
      });

      res.json({
        message: "Role updated successfully",
        role: {
          id: role.id,
          user_id: role.user_id,
          role_name: role.role_name,
          assigned_at: role.assigned_at,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating role", error });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      const role = await UserRole.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      await role.destroy();

      await this.kafkaService.publish('role.deleted', {
        userId: role.user_id,
        role_name: role.role_name,
        eventType: 'role.deleted',
      });

        res.json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting role", error });
    }
  }

  async getRoles(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;

      let roles;
      if (userId) {
        roles = await UserRole.findAll({
          where: { user_id: userId },
          include: [
            {
              model: User,
              attributes: ["user_id", "username", "name"],
            },
          ],
        });
      } else {
        roles = await UserRole.findAll({
          include: [
            {
              model: User,
              attributes: ["user_id", "username", "name"],
            },
          ],
        });
      }

      res.json({
        roles: roles.map((role) => ({
          id: role.id,
          user_id: role.user_id,
          role_name: role.role_name,
          assigned_at: role.assigned_at,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching roles", error });
    }
  }
}
