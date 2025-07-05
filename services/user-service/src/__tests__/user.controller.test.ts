import { UserController } from '../controllers/user.controller';
import { Request, Response } from 'express';
import { User } from '../models/user.model';


jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUser = new User({
    user_id: 'test-user-id',
    username: 'existinguser',
    name: 'Existing User',
    role: 'user',
    login_url: 'http://localhost:3000/login', // Add this line
    utility_id: 'test-utility',
    contact_info: {
      email: 'existing@example.com'
    },
    password: 'password123',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });

describe('UserController', () => {
  let userController: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    userController = new UserController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      req.body = {
        username: 'newuser',
        name: 'New User',
        role: 'user',
        utility_id: 'test-utility',
        contact_info: {
          email: 'new@example.com'
        },
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue(mockUser);

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: {
          user_id: mockUser.user_id,
          username: mockUser.username,
          name: mockUser.name,
          role: mockUser.role,
          utility_id: mockUser.utility_id,
          contact_info: mockUser.contact_info,
          status: mockUser.status,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at
        }
      });
    });

    it('should return error for existing username', async () => {
      req.body = {
        username: 'existinguser',
        name: 'Existing User',
        role: 'user',
        utility_id: 'test-utility',
        contact_info: {
          email: 'existing@example.com'
        },
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username already exists' });
    });

    it('should return error for missing contact info', async () => {
      req.body = {
        username: 'newuser',
        name: 'New User',
        role: 'user',
        utility_id: 'test-utility',
        contact_info: {},
        password: 'password123'
      };

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'At least one contact method (email or phone) is required'
      });
    });
  });

  describe('login', () => {
 
    it('should return error for invalid credentials', async () => {
      req.body = {
        identifier: 'invalid@example.com',
        password: 'wrongpassword',
        type: 'email'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});
