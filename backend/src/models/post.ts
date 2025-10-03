import mongoose, { Schema } from 'mongoose';
import { IPost, IComment, IMedia } from '../types';

const mediaSchema = new Schema<IMedia>({
  type: { 
    type: String, 
    enum: ['image', 'video'], 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  publicId: { 
    type: String, 
    required: true 
  },
  alt: String,
  width: Number,
  height: Number
});

const commentSchema = new Schema<IComment>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 500 
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  replies: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  }]
}, {
  timestamps: true
});

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
  media: [mediaSchema],
  hashtags: [{ 
    type: String, 
    trim: true,
    lowercase: true 
  }],
  mentions: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  location: {
    name: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  challenge: { 
    type: Schema.Types.ObjectId, 
    ref: 'Challenge' 
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [commentSchema],
  shares: { 
    type: Number, 
    default: 0 
  },
  isEcoPost: { 
    type: Boolean, 
    default: true 
  },
  ecoCategory: { 
    type: String, 
    enum: ['gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action']
  },
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'friends'], 
    default: 'public' 
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ ecoCategory: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ challenge: 1 });
postSchema.index({ createdAt: -1 });

// Text index for search
postSchema.index({
  content: 'text',
  hashtags: 'text',
  'location.name': 'text'
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  const likes = this.likes.length;
  const comments = this.comments.length;
  const shares = this.shares;
  const hours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  
  // Weighted engagement score with time decay
  return Math.round((likes * 1 + comments * 2 + shares * 3) / Math.log(hours + 2));
});

// Pre-save middleware to extract hashtags and mentions
postSchema.pre('save', function(next) {
  // Extract hashtags
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const hashtagMatches = this.content.match(hashtagRegex);
  if (hashtagMatches) {
    this.hashtags = [...new Set(hashtagMatches.map(tag => tag.slice(1).toLowerCase()))];
  }
  
  next();
});

export default mongoose.model<IPost>('Post', postSchema);