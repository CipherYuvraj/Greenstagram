export interface User {
  _id: string;
  username: string;
  email: string;
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
  badges: Badge[];
  followers: User[];
  following: User[];
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    posts: number;
    followers: number;
    following: number;
    totalLikes: number;
  };
}

export interface Post {
  _id: string;
  userId: User;
  content: string;
  media: Media[];
  hashtags: string[];
  mentions: User[];
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  challenge?: Challenge;
  likes: User[];
  comments: Comment[];
  shares: number;
  isEcoPost: boolean;
  ecoCategory?: string;
  visibility: 'public' | 'private' | 'friends';
  createdAt: Date;
  updatedAt: Date;
  engagementScore?: number;
}

export interface Comment {
  _id: string;
  userId: User;
  content: string;
  likes: User[];
  replies: Comment[];
  createdAt: Date;
}

export interface Media {
  type: 'image' | 'video';
  url: string;
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  duration: number;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rules: string[];
  media?: Media;
  participants: User[];
  submissions: Submission[];
  leaderboard: LeaderboardEntry[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: Date;
  endDate: Date;
  createdBy: User;
  createdAt: Date;
  isParticipating?: boolean;
  participantCount?: number;
}

export interface Submission {
  userId: string;
  postId: string;
  score: number;
  verified: boolean;
  verifiedBy?: string;
  submittedAt: Date;
}

export interface LeaderboardEntry {
  userId: User;
  score: number;
  rank: number;
  badge?: string;
}

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'activity' | 'challenge' | 'streak' | 'special';
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'challenge' | 'badge' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
