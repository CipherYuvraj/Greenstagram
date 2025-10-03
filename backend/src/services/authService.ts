import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user';
import { azureKeyVault } from '../config/azure';
import { logger } from '../utils/logger';

export class AuthService {
  async getJWTSecret(): Promise<string> {
    try {
      // This will now properly attempt Key Vault first, then fallback
      const secret = await azureKeyVault.getSecret('jwt-secret', 'JWT_SECRET');
      return secret;
    } catch (error) {
      logger.error('Failed to get JWT secret:', error);
      throw new Error('Authentication configuration error');
    }
  }

  async generateToken(userId: string): Promise<string> {
    try {
      const secret = await this.getJWTSecret();
      return jwt.sign(
        { userId },
        secret,
        { 
          expiresIn: '7d',
          issuer: 'greenstagram-api',
          audience: 'greenstagram-app'
        }
      );
    } catch (error) {
      logger.error('Failed to generate token:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const secret = await this.getJWTSecret();
      const decoded = jwt.verify(token, secret, {
        issuer: 'greenstagram-api',
        audience: 'greenstagram-app'
      }) as { userId: string };
      
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  async registerUser(userData: {
  username: string;
  email: string;
  password: string;
  bio?: string;
  interests?: string[];
}, _email: any, _password: any, _bio: any, _interests: any): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error('Email already in use');
        } else {
          throw new Error('Username already taken');
        }
      }

      // Create new user (password will be hashed by pre-save middleware)
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        bio: userData.bio || '',
        interests: userData.interests || []
      });

      await user.save();
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = await this.generateToken(user._id.toString());

      logger.trackEvent('UserRegistered', { userId: user._id, username: user.username });

      return { user, token };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  async loginUser(emailOrUsername: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email or username
      const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        isActive: true
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = await this.generateToken(user._id.toString());

      logger.trackEvent('UserLoggedIn', { userId: user._id, username: user.username });

      return { user, token };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).select('-password');
      return user as IUser | null;
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
