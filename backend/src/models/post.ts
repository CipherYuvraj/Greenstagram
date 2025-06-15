import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  imageUrls: string[];
  videoUrls: string[];
  hashtags: string[];
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
    name: string;
  };
  ecoChallenge?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  shares: number;
  visibility: 'public' | 'followers' | 'private';
  ecoPoints: number;
  // AI-powered features
  plantData?: {
    species?: string;
    confidence?: number;
    healthScore?: number;
    tips?: string[];
  };
}

const postSchema = new Schema<IPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  imageUrls: [{
    type: String,
    validate: {
      validator: (url: string) => /^https?:\/\/.+/.test(url),
      message: 'Invalid image URL'
    }
  }],
  videoUrls: [{
    type: String,
    validate: {
      validator: (url: string) => /^https?:\/\/.+/.test(url),
      message: 'Invalid video URL'
    }
  }],
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9_]+$/
  }],
  location: {
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    name: String
  },
  ecoChallenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  ecoPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  // AI-powered plant identification data
  plantData: {
    species: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100
    },
    tips: [String]
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);