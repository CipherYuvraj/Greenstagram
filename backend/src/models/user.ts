import { Schema, model, Document } from 'mongoose';

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
    lastActivity: Date;
  };
  interests: string[];
  followers: Schema.Types.ObjectId[];
  following: Schema.Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  profilePicture: {
    type: String,
    default: '',
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot exceed 150 characters'],
    trim: true,
    default: ''
  },
  
  ecoLevel: {
    type: Number,
    default: 1,
    min: [1, 'Eco level cannot be less than 1'],
    max: [100, 'Eco level cannot exceed 100']
  },
  
  ecoPoints: {
    type: Number,
    default: 0,
    min: [0, 'Eco points cannot be negative']
  },
  
  badges: [{
    type: String,
    enum: [
      'first-post', 'eco-warrior', 'plant-lover', 'recycling-champion',
      'energy-saver', 'water-guardian', 'green-commuter', 'zero-waste',
      'community-leader', 'challenge-master', 'streak-keeper', 'nature-photographer'
    ]
  }],
  
  streaks: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current streak cannot be negative']
    },
    longest: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  interests: [{
    type: String,
    enum: [
      'recycling', 'renewable-energy', 'sustainable-living', 'zero-waste',
      'gardening', 'composting', 'eco-travel', 'green-technology',
      'climate-action', 'wildlife-conservation', 'organic-farming', 'water-conservation'
    ]
  }],
  
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for followers count
userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Index for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ ecoPoints: -1 });
userSchema.index({ ecoLevel: -1 });

export const User = model<IUser>('User', userSchema);