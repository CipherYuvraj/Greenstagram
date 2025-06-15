import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  ecoLevel: number;
  ecoPoints: number;
  badges: string[];
  streaks: {
    current: number;
    longest: number;
    lastActivity?: Date;
  };
  interests: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  ecoLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  ecoPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    type: String,
    enum: ['eco_warrior', 'plant_expert', 'recycling_master', 'energy_saver', 'water_guardian']
  }],
  streaks: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    longest: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivity: Date
  },
  interests: [{
    type: String,
    enum: ['recycling', 'gardening', 'renewable_energy', 'sustainable_living', 'wildlife_conservation', 'zero_waste']
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);