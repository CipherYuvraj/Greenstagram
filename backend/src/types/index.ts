import { Types } from 'mongoose';
import { Request } from 'express';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  streak?:number;
//   lastActive?:Date;
  profilePicture?: string;
  coverPicture?: string;
  bio?: string;
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  interests: string[];
  ecoPoints: number;
  ecoLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActive: Date;
  badges: IBadge[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  media: IMedia[];
  hashtags: string[];
  mentions: Types.ObjectId[];
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  challenge?: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  shares: number;
  isEcoPost: boolean;
  ecoCategory?: string;
  visibility: 'public' | 'private' | 'friends';
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  replies: IComment[];
  createdAt: Date;
}

export interface IMedia {
  type: 'image' | 'video';
  url: string;
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IChallenge {
  _id: Types.ObjectId;
  title: string;
  description: string;
  duration: number;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rules: string[];
  media?: IMedia;
  participants: Types.ObjectId[];
  submissions: ISubmission[];
  leaderboard: ILeaderboardEntry[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: Date;
  endDate: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface ISubmission {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  score: number;
  verified: boolean;
  verifiedBy?: Types.ObjectId;
  submittedAt: Date;
}

export interface ILeaderboardEntry {
  userId: Types.ObjectId;
  score: number;
  rank: number;
  badge?: string;
}

export interface IBadge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'activity' | 'challenge' | 'streak' | 'special';
}

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'challenge' | 'badge' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  [x: string]: any;
  user?: IUser;
}

export interface SearchFilters {
  type?: 'posts' | 'users' | 'hashtags' | 'challenges';
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  cursor?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    total?: number;
  };
}
