import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/Index';

export class AuthService {
  private keyVaultClient: SecretClient;
  private keyVaultUri: string;
  private defaultSecret: string;
  
  constructor() {
    this.keyVaultUri = process.env.KEYVAULT_URI || '';
    this.defaultSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    
    // Only initialize Key Vault client if URI is provided
    if (this.keyVaultUri) {
      try {
        const credential = new DefaultAzureCredential();
        this.keyVaultClient = new SecretClient(this.keyVaultUri, credential);
        console.log("✅ Azure Key Vault client initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize Azure Key Vault client:", error);
      }
    } else {
      console.log("⚠️ No Key Vault URI provided, using environment variable JWT secret");
    }
  }

  async getJWTSecret(): Promise<string> {
    if (!this.keyVaultUri || !this.keyVaultClient) {
      return this.defaultSecret;
    }
    
    try {
      const secret = await this.keyVaultClient.getSecret('jwt-secret');
      return secret.value || this.defaultSecret;
    } catch (error) {
      console.error("❌ Failed to fetch JWT secret from Key Vault, using fallback:", error);
      return this.defaultSecret;
    }
  }

  async generateToken(userId: string): Promise<string> {
    const secret = await this.getJWTSecret();
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }

  async verifyToken(token: string): Promise<any> {
    const secret = await this.getJWTSecret();
    return jwt.verify(token, secret);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async registerUser(username: string, email: string, password: string, bio?: string, interests?: string[]): Promise<any> {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already in use');
      } else {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      bio: bio || '',
      interests: interests || []
    });

    await user.save();
    
    // Generate token
    const token = await this.generateToken((user._id as any).toString());

    return {
      userId: user._id,
      token,
      username: user.username,
      email: user.email,
      ecoLevel: user.ecoLevel,
      ecoPoints: user.ecoPoints
    };
  }

  async loginUser(emailOrUsername: string, password: string): Promise<any> {
    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = await this.generateToken((user._id as string).toString());

    return {
      userId: user._id,
      token,
      username: user.username,
      email: user.email,
      ecoLevel: user.ecoLevel,
      ecoPoints: user.ecoPoints
    };
  }
}

export default new AuthService();
