import { Request, Response } from "express";
import { User, IUser, LoginHistory } from "../models/user.model";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { AuthService } from "@shared/auth-service";
import { role } from "@shared/middleware/auth.middleware";
import bcrypt from "bcryptjs";
import { KafkaService } from "../services/kafka.service";
import { messagingService } from "../services/messaging.service";
import { Otp } from "../models/otp.model";
import { CommonService } from "../services/common.service";
import generator from "generate-password";
import { HierarchyItem } from "../models/common.model";
import { Sequelize } from "sequelize";

const commonService = new CommonService();

declare global {
  namespace Express {
    interface Request {
      user?: {
        [key: string]: any;
        id: string;
        role: role | string;
      };
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
  otp: string;
}

type IdentifierType = "email" | "phone";

export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isPhone(value: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(value);
}

export class UserController {
  public readonly JWT_SECRET: string = process.env.JWT_SECRET || "";
  public readonly JWT_EXPIRES_IN: string = "24h";
  public readonly OTP_EXPIRES_IN_MINUTES: number =
    Number(process.env.OTP_EXPIRES_IN_MINUTES) || 5; // 5 minutes
  public readonly OTP_LENGTH: number = Number(process.env.OTP_LENGTH) || 6;

  private readonly transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  private authService: AuthService;
  private kafkaService: KafkaService;

  constructor() {
    this.authService = new AuthService();
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

  private async storeOTP(
    identifier: string,
    otp: string,
    userId?: string
  ): Promise<void> {
    console.log(`Storing OTP for identifier: ${identifier} in database`);
    try {
      const expiresAt = new Date(
        Date.now() + this.OTP_EXPIRES_IN_MINUTES * 60 * 1000
      );
      // Consider invalidating previous active OTPs for the same identifier
      await Otp.update(
        { is_used: true },
        { where: { identifier, is_used: false } }
      );

      await Otp.create({
        identifier,
        otp_code: otp, // SECURITY: Consider hashing OTPs: await bcrypt.hash(otp, 10)
        expires_at: expiresAt,
        user_id: userId, // Optional: link to user if available
        is_used: false,
      });
      console.log(
        `OTP stored successfully in database for identifier: ${identifier}`
      );
    } catch (error) {
      console.error(`Error storing OTP in database for ${identifier}:`, error);
      // Depending on policy, you might want to re-throw to signal failure to the caller
    }
  }

  private async sendOTPEmail(email: string, otp: string): Promise<void> {
    console.log("Sending OTP email to:", email);
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verification OTP",
      text: `Your verification OTP is: ${otp}. This OTP will expire in ${this.OTP_EXPIRES_IN_MINUTES} minutes.`,
    });
  }

  private async sendOTPPhone(phone: string, otp: string): Promise<void> {
    await messagingService.sendOTP(phone, otp, "whatsapp");
    await messagingService.sendOTP(phone, otp, "sms");
  }

  private async validateOTP(
    identifier: string,
    otpToValidate: string
  ): Promise<boolean> {
    console.log(`Validating OTP for ${identifier} from database.`);
    try {
      const otpRecord = await Otp.findOne({
        where: {
          identifier,
          is_used: false, // Only find OTPs that haven't been used
        },
        order: [["createdAt", "DESC"]], // Get the most recent active OTP
      });

      if (!otpRecord) {
        console.log(
          `validateOTP: No active OTP found in DB for identifier: ${identifier}`
        );
        return false;
      }

      // Check for expiration
      if (new Date() > new Date(otpRecord.expires_at)) {
        console.log(`validateOTP: OTP expired for identifier: ${identifier}`);
        await otpRecord.update({ is_used: true }); // Mark as used
        return false;
      }

      // SECURITY: If OTPs are hashed in DB, use: const isMatch = await bcrypt.compare(otpToValidate, otpRecord.otp_code);
      const isMatch = otpRecord.otp_code === otpToValidate; // For plaintext OTPs

      if (isMatch) {
        console.log(`validateOTP: OTP matched for ${identifier}.`);
        // IMPORTANT: Marking as used should typically happen after the primary action (e.g., login) is successful.
        // For a generic validateOTP, this might be okay, or defer to the calling function.
        // await otpRecord.update({ is_used: true });
        return true;
      }

      console.log(`validateOTP: Incorrect OTP for identifier: ${identifier}`);
      return false;
    } catch (error) {
      console.error(
        `Error during validateOTP from DB for ${identifier}:`,
        error
      );
      return false;
    }
  }

  async requestOTP(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body as {
        identifier: string;
        password: string;
      };

      if (!identifier || !password) {
        return res
          .status(400)
          .json({ message: "Identifier, and password are required" });
      }

      function getIdentifierType(identifier: string): IdentifierType | null {
        if (isEmail(identifier)) return "email";
        if (isPhone(identifier)) return "phone";
        return null;
      }

      const type: IdentifierType | null = getIdentifierType(identifier);

      // Validate email format if type is email
      if (type === "email" && !isEmail(identifier)) {
        return res.status(400).json({ message: "Invalid email format" });
      } else if (type === "phone" && !isPhone(identifier)) {
        // Validate phone number format if type is phone
        return res.status(400).json({ message: "Invalid phone number format" });
      } else if (type === null) {
        // Default error case for invalid or undefined type
        return res.status(400).json({ message: "Invalid identifier type" });
      }

      console.log("requestOTP", identifier, type, password);

      let user: IUser | null;

      if (type === "email") {
        user = await User.findOne({
          where: {
            "contact_info.email": identifier,
          },
        });
      } else {
        user = (await User.findOne({
          where: {
            "contact_info.phone": identifier,
          },
        })) as IUser | null;
      }

      console.log("req-erro:", user);

      if (!user) {
        return res
          .status(401)
          .json({ message: "User not found or invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "User not found or invalid credentials" });
      }

      const otpGenerated = this.generateOTP();

      // Store OTP with identifier (and optionally userId if available)
      await this.storeOTP(identifier, otpGenerated, user?.user_id);

      console.log(otpGenerated);
      // Send OTP based on type
      switch (type) {
        case "email":
          await this.sendOTPEmail(identifier, otpGenerated);
          break;
        case "phone":
          await this.sendOTPPhone(identifier, otpGenerated);
          break;
        default:
          return res.status(400).json({ message: "Invalid type" });
      }

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error sending OTP",
        error: error instanceof Error ? error.message : "Unknown error",
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
        return res.status(400).json({
          message: "Both email and phone are required.",
        });
      }

      // Validate phone number format if type is phone
      if (
        role === "email" &&
        !isEmail(contact_info?.email) &&
        !isPhone(contact_info?.phone)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid phone number format1" });
      } else if (role === "phone" && !isPhone(contact_info?.phone)) {
        // Validate phone number format if type is phone
        return res
          .status(400)
          .json({ message: "Invalid phone number format2" });
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

      // // Create user role
      // await UserRole.create({
      //   user_id: user.user_id,
      //   role_name: role,
      // });

      const token = AuthService.generateAuthToken({
        role: user.role as role,
        id: user.user_id,
      });
      // req.token = token;
      await this.kafkaService.publish("user.created", {
        userId: user.user_id,
        email: user.contact_info.email,
        name: user.name,
        createdAt: new Date().toISOString(),
        eventType: "user.created",
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
        token,
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
      const { identifier, password, otp } = req.body as LoginRequest;

      if (!identifier || !password || !otp) {
        return res
          .status(400)
          .json({ message: "Identifier, password, and OTP are required" });
      }

      let user: IUser | null = null;

      let type: IdentifierType;

      if (isEmail(identifier)) {
        type = "email";
      } else if (isPhone(identifier)) {
        type = "phone";
      } else {
        throw new Error(
          "Invalid identifier: must be a valid email or phone number"
        );
      }

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
        default:
          return res
            .status(400)
            .json({
              message:
                "Invalid identifier: must be a valid email or phone number",
            });
      }

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid credentials11" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify OTP
      const isOtpValid = await this.verifyLoginOTP(req, res);
      if (!isOtpValid) {
        return; // OTP is invalid, and verifyLoginOTP should have already sent the response.
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

      // // Generate JWT token
      // const token = jwt.sign(
      //   { user_id: user.user_id },
      //   process.env.JWT_SECRET as string,
      //   { expiresIn: "24h" }
      // );
      const token = AuthService.generateToken({
        id: user.user_id,
        role: user.role as role,
      });

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
      res.status(500).json({
        message: "Error during login",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async verifyLoginOTP(req: Request, res: Response): Promise<boolean> {
    const { identifier, otp } = req.body as {
      identifier: string;
      otp: string /* other fields */;
    };

    if (!identifier || !otp) {
      res
        .status(400)
        .json({ message: "Identifier and OTP are required for verification." });
      return false;
    }

    console.log(`Verifying login OTP for ${identifier} from database.`);
    try {
      const otpRecord = await Otp.findOne({
        where: {
          identifier,
          is_used: false, // Only find OTPs that haven't been used
        },
        order: [["createdAt", "DESC"]], // Get the most recent active OTP
      });

      if (!otpRecord) {
        console.log(
          `verifyLoginOTP: No active OTP found in DB for identifier: ${identifier}`
        );
        res.status(401).json({ message: "Invalid or expired OTP." });
        return false;
      }

      // Check for expiration
      if (new Date() > new Date(otpRecord.expires_at)) {
        console.log(
          `verifyLoginOTP: OTP expired for identifier: ${identifier}`
        );
        await otpRecord.update({ is_used: true }); // Mark as used
        res.status(401).json({ message: "Invalid or expired OTP." });
        return false;
      }

      // SECURITY: If OTPs are hashed in DB, use: const isOtpMatch = await bcrypt.compare(otp, otpRecord.otp_code);
      const isOtpMatch = otpRecord.otp_code === otp; // For plaintext OTPs

      if (!isOtpMatch) {
        console.log(
          `verifyLoginOTP: Incorrect OTP for identifier: ${identifier}`
        );
        // Note: Do NOT mark OTP as used for incorrect attempts. Allow user to retry with the same OTP if it's still valid.
        // Implement attempt limiting separately if needed.
        res.status(401).json({ message: "Invalid or expired OTP." });
        return false;
      }

      // OTP is valid and matches
      console.log(
        `verifyLoginOTP: OTP verified successfully for identifier: ${identifier}`
      );
      // Mark OTP as used to prevent reuse AFTER successful verification in the login flow
      await otpRecord.update({ is_used: true });
      return true; // OTP is valid, DO NOT send a response here.
    } catch (error) {
      console.error(
        `Error during OTP verification with DB for ${identifier}:`,
        error
      );
      res.status(500).json({ message: "Error during OTP verification" });
      return false;
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
      res.clearCookie("token");

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

      // const userRoles = await UserRole.find({ user_id: userId });

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
          roles: [],
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

      await this.kafkaService.publish("user.updated", {
        userId: updatedUser.user_id,
        name: updatedUser.name,
        contact_info: updatedUser.contact_info,
        status: updatedUser.status,
        updatedAt: updatedUser.updated_at,
        eventType: "user.updated",
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

      await this.kafkaService.publish("user.password.updated", {
        userId,
        eventType: "user.password.updated",
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password", error });
    }
  }

  async createCommonDetails(req: Request, res: Response) {
    try {
      const { type, code, name, description, is_active } = req.body;

      if (!type || !code || !name || !description || !is_active) {
        return res.status(400).json({
          success: false,
          error: "`type`, `code`, and `name` are required fields.",
        });
      }

      if (
        typeof type !== "string" ||
        typeof code !== "string" ||
        typeof name !== "string"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid data format. `type`, `code`, and `name` must be strings.",
        });
      }

      const upperCode = code.toLowerCase();
      let metadata = {};

      if (type.toLowerCase() === "role") {
        if (upperCode === "staff") {
          metadata = { visibleTo: ["admin", "superadmin"] };
        } else if (upperCode === "admin") {
          metadata = { visibleTo: ["superadmin"] };
        } else if (upperCode === "superadmin") {
          metadata = { visibleTo: [] };
        }
      }

      const data = await commonService.create({
        type: type.toLowerCase(),
        code: upperCode,
        name,
        description,
        is_active: is_active !== false,
        metadata,
      });

      return res.status(201).json({
        success: true,
        message: `Common detail created successfully under type '${type}' with code '${code}'.`,
        data,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error:
          error.message || "Internal server error. Please try again later.",
      });
    }
  }

  async getRoleTypes(req: Request, res: Response) {
    try {
      const userRole = req.user?.role as string;
      const typeDataRaw = req.query.typeData;

      if (!typeDataRaw || typeof typeDataRaw !== "string") {
        return res.status(400).json({
          success: false,
          error: "`typeData` query parameter is required and must be a string",
        });
      }

      const roles = await HierarchyItem.findAll({
        where: { type: typeDataRaw.toLowerCase(), is_active: true },
        attributes: ["code", "metadata"],
      });

      const allowedRoles = roles
        .filter((role) => {
          const visibleTo = role.metadata?.visibleTo || [];
          return visibleTo.includes(userRole);
        })
        .map((role) => role.code);

      return res.status(200).json({
        success: true,
        message: `Fetched allowed role codes for ${userRole}`,
        data: allowedRoles,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async getAllRolesDetails(req: Request, res: Response) {
    try {
      const data = await commonService.getAll();
      return res.status(200).json({
        success: true,
        message: "Fetched all role details successflly.",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async deleteCommonDetail(req: Request, res: Response) {
    try {
      const { type, code } = req.query;

      if (!type || !code) {
        return res.status(400).json({
          success: false,
          error: "Missing type or code query parameters: `type` and `code`",
        });
      }

      const deleted = await commonService.delete(String(type), String(code));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `No item found with type '${type}' and code '${code}'`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Item with type '${type}' and code '${code}' deleted successfully`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { phone, email, name, utility_id, role } = req.body;

      // Validate required fields
      if ((!phone && !email) || !name || !utility_id || !role) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: name, utility_id, role, and either phone or email are required.",
        });
      }

      if (phone) {
        const phoneExits = await User.findOne({
          where: Sequelize.where(
            Sequelize.literal(`contact_info->>'phone'`),
            phone
          ),
        });
        if (phoneExits) {
          return res.status(409).json({
            success: false,
            error: `Phone number '${phone}' is already registered`,
          });
        }
      }

      if (email) {
        const emailExits = await User.findOne({
          where: Sequelize.where(
            Sequelize.literal(`contact_info->>'email'`),
            email
          ),
        });
        if (emailExits) {
          return res.status(409).json({
            success: false,
            error: `Email '${email}' is already registered`,
          });
        }
      }

      if (name) {
        const usernameExists = await User.findOne({
          where: { username: name },
        });
        if (usernameExists) {
          return res.status(409).json({
            success: false,
            error: `Username '${name}' is already taken`,
          });
        }
      }

      // Validate role
      const isValid = await User.isValidRole(role);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: `Role '${role}' is not allowed for utility '${utility_id}'`,
        });
      }

      const password = generator.generate({
        length: 10,
        numbers: true,
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        user_id: uuidv4(),
        username: name,
        name,
        role: role.toLowerCase(),
        utility_id: utility_id,
        password: hashedPassword,
        login_url: "",
        status: "INACTIVE",
        contact_info: {
          phone: phone || "",
          email: email || "",
        },
      });

      res.status(201).json({
        success: true,
        message: "User created successfully.",
        user: {
          username: user.username,
          password: password,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: "Internal server error. Please try again later",
      });
    }
  }

  async getNamesByType(req: Request, res: Response) {
    try {
      const { field } = req.query;

      if (!field || typeof field !== "string") {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "type" is required and must be a string.',
          data: [],
          error: 'Invalid or missing "type" parameter',
        });
      }

      const names = await commonService.getNamesByType(field);

      if (!names.length) {
        return res.status(404).json({
          success: false,
          message: `No records found for type '${field}'.`,
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: `Successfully fetched names for type '${field}'.`,
        data: names,
        error: {},
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error while fetching names.",
        data: [],
      });
    }
  }
}
