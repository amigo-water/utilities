import jwt from 'jsonwebtoken';
import { role } from './middleware/auth.middleware';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly TOKEN_EXPIRY = '24h';

  static async verifyToken(token: string): Promise<any> {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.JWT_SECRET!, (err, decoded) => {
        if (err) {
          reject(new Error('Invalid or expired token'));
        } else {
          resolve(decoded);
        }
      });
    });
  }

  static generateToken(
    payload: { 
      id: string; 
      role: role;
      [key: string]: any;
    }, 
  ): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
  }

  // Utility method to generate tokens with standard claims
  static generateAuthToken(user: {
    id: string;
    role: role;
    [key: string]: any;
  }): string {
    return this.generateToken({
      id: user.id,
      role: user.role,
      // Add any additional standard claims here
    });
  }
}