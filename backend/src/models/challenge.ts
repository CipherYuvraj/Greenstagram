import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ecoPoints: number;
  startDate: Date;
  endDate: Date;
  participants: mongoose.Types.ObjectId[];
  completedBy: mongoose.Types.ObjectId[];
  requirements: string[];
  badge?: string;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

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
  category: {
    type: String,
    required: true,
    enum: ['recycling', 'energy', 'transportation', 'water', 'gardening', 'waste_reduction']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  ecoPoints: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IChallenge, endDate: Date) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  requirements: [{
    type: String,
    required: true
  }],
  badge: {
    type: String,
    enum: ['eco_warrior', 'plant_expert', 'recycling_master', 'energy_saver', 'water_guardian']
  },
  imageUrl: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);