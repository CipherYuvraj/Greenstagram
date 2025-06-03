import { Schema, model, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  duration: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  points: number;
  participants: Schema.Types.ObjectId[];
  leaderboard: {
    userId: Schema.Types.ObjectId;
    score: number;
    completedAt?: Date;
  }[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requirements: {
    postsRequired: number;
    hashtagsRequired: string[];
    activitiesRequired: string[];
  };
  rewards: {
    points: number;
    badges: string[];
    specialRewards: string[];
  };
  startDate: Date;
  endDate: Date;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  type: {
    type: String,
    enum: ['individual', 'team', 'community'],
    required: [true, 'Challenge type is required']
  },
  
  duration: {
    value: {
      type: Number,
      required: [true, 'Duration value is required'],
      min: [1, 'Duration must be at least 1']
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      required: [true, 'Duration unit is required']
    }
  },
  
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative']
  },
  
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  leaderboard: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be negative']
    },
    completedAt: {
      type: Date
    }
  }],
  
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'recycling', 'energy-saving', 'water-conservation', 'sustainable-transport',
      'zero-waste', 'gardening', 'composting', 'eco-shopping', 'climate-action'
    ]
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Difficulty level is required']
  },
  
  requirements: {
    postsRequired: {
      type: Number,
      default: 1,
      min: [0, 'Posts required cannot be negative']
    },
    hashtagsRequired: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    activitiesRequired: [{
      type: String,
      trim: true
    }]
  },
  
  rewards: {
    points: {
      type: Number,
      required: [true, 'Reward points are required'],
      min: [0, 'Reward points cannot be negative']
    },
    badges: [{
      type: String
    }],
    specialRewards: [{
      type: String
    }]
  },
  
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IChallenge, v: Date) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participants count
challengeSchema.virtual('participantsCount').get(function() {
  return this.participants.length;
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const diffTime = this.endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
challengeSchema.index({ status: 1, startDate: 1 });
challengeSchema.index({ category: 1 });
challengeSchema.index({ participants: 1 });
challengeSchema.index({ createdBy: 1 });

export const Challenge = model<IChallenge>('Challenge', challengeSchema);