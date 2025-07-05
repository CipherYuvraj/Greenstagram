import express from 'express';
import Notification from '@/models/Notification';
import { authenticate } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req: express.Request, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const skip = (page - 1) * limit;

    const query: any = { userId: (req as any).user!._id };
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      userId:(req as any).user!._id,
      read: false
    });

    res.json({
      success: true,
      data: { 
        notifications,
        unreadCount
      },
      pagination: {
        hasMore: notifications.length === limit
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: express.Request, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user!._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating notification'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: express.Request, res) => {
  try {
    await Notification.updateMany(
      { userId: (req as any).user!._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notifications'
    });
  }
});

export default router;
