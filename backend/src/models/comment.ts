import { Schema, model, Document } from 'mongoose';

export interface IComment extends Document {
  postId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  content: string;
  likes: Schema.Types.ObjectId[];
  replies: Schema.Types.ObjectId[];
  parentId?: Schema.Types.ObjectId;
  mentions: Schema.Types.ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required']
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
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
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for replies count
commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Indexes
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 });

export const Comment = model<IComment>('Comment', commentSchema);