import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
  userId: Schema.Types.ObjectId;
  content: string;
  images: string[];
  videos: string[];
  hashtags: string[];
  location?: {
    name: string;
    coordinates: [number, number];
    placeId?: string;
  };
  ecoChallenge?: Schema.Types.ObjectId;
  likes: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  shares: number;
  visibility: 'public' | 'private' | 'friends';
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2200, 'Post content cannot exceed 2200 characters'],
    trim: true
  },
  
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  
  videos: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(mp4|webm|ogg|mov)$/i.test(v);
      },
      message: 'Invalid video URL format'
    }
  }],
  
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Hashtags can only contain letters, numbers, and underscores']
  }],
  
  location: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Location name cannot exceed 100 characters']
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates format [longitude, latitude]'
      }
    },
    placeId: {
      type: String,
      trim: true
    }
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
    min: [0, 'Shares cannot be negative']
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Indexes for performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ ecoChallenge: 1 });
postSchema.index({ createdAt: -1 });

export const Post = model<IPost>('Post', postSchema);