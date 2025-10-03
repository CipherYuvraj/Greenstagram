import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IBadge } from '../types';
import { io } from '../index';

const badgeSchema = new Schema<IBadge>({
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  category: { 
    type: String, 
    enum: ['activity', 'challenge', 'streak', 'special'], 
    required: true 
  }
});

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  ecoLevel: number;
  ecoPoints: number;
  badges: IBadge[]; // Changed from string[] to IBadge[]
  streaks: {
    current: number;
    longest: number;
    lastActivity?: Date;
  };
  interests: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastActive: Date;
  lastLogin?: Date;
  currentStreak: number;
  longestStreak: number; // Add this missing property
  isPrivate: boolean;
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
  badges: [badgeSchema], // This is correct - using the badge schema
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
  lastLogin: Date,
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ ecoPoints: -1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

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

// Pre-save middleware for eco-level calculation and notifications
userSchema.pre('save', async function(next) {
  if (this.isModified('ecoPoints')) {
    const newLevel = Math.floor(this.ecoPoints / 100) + 1;
    const oldLevel = this.ecoLevel;
    
    this.ecoLevel = newLevel;
    
    // Level up notification
    if (newLevel > oldLevel) {
      try {
        io.emit(`user:${this._id}:levelup`, { 
          newLevel, 
          ecoPoints: this.ecoPoints 
        });
      } catch (error) {
        console.warn('Failed to emit level up event:', error);
      }
    }
    
    // Points update notification
    try {
      io.emit(`user:${this._id}:points`, { 
        ecoPoints: this.ecoPoints, 
        ecoLevel: this.ecoLevel 
      });
    } catch (error) {
      console.warn('Failed to emit points update event:', error);
    }
  }
  next();
});
userSchema.methods.addBadge = function(badge: any) {
  if (!this.badges) {
    this.badges = [];
  }
   if (!this.badges.some((b: any) => b.badgeId === badge.badgeId)) {
    this.badges.push(badge);
  }
};
// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addBadge = function(badge: Omit<IBadge, 'earnedAt'>) {
  const existingBadge = this.badges.find((b: IBadge) => b.badgeId === badge.badgeId);
  if (!existingBadge) {
    this.badges.push({ ...badge, earnedAt: new Date() });
    
    // Emit badge earned event
    try {
      io.emit(`user:${this._id}:badge`, this.badges[this.badges.length - 1]);
    } catch (error) {
      console.warn('Failed to emit badge event:', error);
    }
  }
};

userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.lastActive || new Date(0);
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.streaks.current += 1;
    this.currentStreak = this.streaks.current; // Keep both in sync
    this.ecoPoints += 10; // Streak bonus
    this.streaks.longest = Math.max(this.streaks.current, this.streaks.longest);
    this.longestStreak = this.streaks.longest; // Keep both in sync
  } else if (diffDays > 1) {
    this.streaks.current = 1;
    this.currentStreak = 1;
  }
  
  this.lastActive = today;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: new RegExp(`^${username}$`, 'i') });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);