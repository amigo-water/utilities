import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth-service';

export type role = 'superadmin' | 'admin' | 'user';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: role | string;
        [key: string]: any;
      };
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = await AuthService.verifyToken(token);
    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRoles = (roles: role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userRole = String(req.user.role);
    const requiredRoles = roles.map(role => String(role));

    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

export const requireAdmin = requireRoles(['admin', 'superadmin']);
export const requireSuperAdmin = requireRoles(['superadmin']);
export const requireUser = requireRoles(['user', 'admin', 'superadmin']);

