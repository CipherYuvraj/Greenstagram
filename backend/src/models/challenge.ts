import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia {
  type: 'image' | 'video';
  url: string;
  publicId: string;
  alt?: string;
}

export interface ISubmission {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  score: number;
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;
}

export interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  score: number;
  rank: number;
  badge?: string;
}

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ecoPoints: number;
  startDate: Date;
  endDate: Date;
  participantCount:number;
  participants: mongoose.Types.ObjectId[];
  completedBy: mongoose.Types.ObjectId[];
  requirements: string[];
  badge?: string;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  duration: number;
  rules: string[];
  media: IMedia;
  submissions: ISubmission[];
  leaderboard: ILeaderboardEntry[];


  
  status: 'draft' | 'active' | 'completed' | 'archived';
}

const submissionSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  verifiedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

const leaderboardEntrySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  rank: { 
    type: Number, 
    required: true 
  },
  badge: String
});

const mediaSchema = new Schema({
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
  alt: String
});

const challengeSchema = new Schema<IChallenge>({
  title: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  description: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  duration: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  ecoPoints: { 
    type: Number, 
    required: true, 
    min: 10 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action']
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  rules: [{ 
    type: String, 
    required: true 
  }],
  media: mediaSchema,
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  submissions: [submissionSchema],
  leaderboard: [leaderboardEntrySchema],
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'archived'], 
    default: 'draft' 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ status: 1, startDate: -1 });
challengeSchema.index({ category: 1 });
challengeSchema.index({ endDate: 1 });
challengeSchema.index({ participants: 1 });

// Text index for search
challengeSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
});

// Virtual for active status
challengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
});

// Method to update leaderboard
challengeSchema.methods.updateLeaderboard = async function() {
  const submissions = this.submissions.filter((sub: ISubmission) => sub.verified);
  
  // Group by user and sum scores
  const userScores = submissions.reduce((acc: any, sub: ISubmission) => {
    if (!acc[sub.userId.toString()]) {
      acc[sub.userId.toString()] = 0;
    }
    acc[sub.userId.toString()] += sub.score;
    return acc;
  }, {});
  
  // Create leaderboard entries
  const leaderboard = Object.entries(userScores)
    .map(([userId, score]) => ({ userId: new mongoose.Types.ObjectId(userId), score: score as number }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      badge: index < 3 ? ['gold', 'silver', 'bronze'][index] : undefined
    }));
  
  this.leaderboard = leaderboard;
  return this.save();
};

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);