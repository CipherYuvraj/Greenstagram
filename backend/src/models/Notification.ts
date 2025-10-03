import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'mention', 'challenge', 'badge', 'system'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  message: { 
    type: String, 
    required: true, 
    maxlength: 300 
  },
  data: Schema.Types.Mixed,
  read: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<INotification>('Notification', notificationSchema);
