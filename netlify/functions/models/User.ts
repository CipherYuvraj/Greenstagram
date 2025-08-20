import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  location?: {
    country: string;
    city: string;
  };
  interests: string[];
  ecoPoints: number;
  ecoLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActive: Date;
  badges: any[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
  location: {
    country: String,
    city: String
  },
  interests: [{
    type: String,
    enum: ['gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action']
  }],
  ecoPoints: {
    type: Number,
    default: 0
  },
  ecoLevel: {
    type: Number,
    default: 1
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['activity', 'challenge', 'streak', 'special']
    }
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
