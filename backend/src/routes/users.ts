import express from 'express';
import User from '@/models/User';
import Post from '@/models/Post';
import Notification from '@/models/Notification';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validateRequest, updateProfileSchema } from '@/middleware/validation';
import { AuthRequest } from '@/types';
import { checkBadges } from '@/utils/badgeTriggers';
import { io } from '../index';
import logger from '@/utils/logger';

const router = express.Router();

// Get user profile
router.get('/:username', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByUsername(req.params.username)
      .select('-password -email')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is private and user is not following
    if (user.isPrivate && req.user) {
      const isFollowing = user.followers.some(follower => follower._id.equals(req.user!._id));
      const isOwner = user._id.equals(req.user._id);
      
      if (!isFollowing && !isOwner) {
        return res.json({
          success: true,
          data: {
            user: {
              _id: user._id,
              username: user.username,
              profilePicture: user.profilePicture,
              bio: user.bio,
              isPrivate: true,
              followers: { count: user.followers.length },
              following: { count: user.following.length }
            },
            isPrivate: true
          }
        });
      }
    }

    // Get user's posts
    const posts = await Post.find({
      userId: user._id,
      visibility: { $in: ['public', 'friends'] }
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('challenge', 'title category')
      .select('media content likes createdAt hashtags');

    // Calculate stats
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
    const postCount = posts.length;

    const userProfile = {
      ...user.toObject(),
      stats: {
        posts: postCount,
        followers: user.followers.length,
        following: user.following.length,
        totalLikes,
        ecoLevel: user.ecoLevel,
        ecoPoints: user.ecoPoints,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      },
      recentPosts: posts,
      isFollowing: req.user ? user.followers.some(follower => follower._id.equals(req.user!._id)) : false,
      isOwner: req.user ? user._id.equals(req.user._id) : false
    };

    res.json({
      success: true,
      data: { user: userProfile }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// Update profile
router.put('/profile', authenticate, validateRequest(updateProfileSchema), async (req: AuthRequest, res) => {
  try {
    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Profile updated by user: ${user.username}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// Follow/unfollow user
router.post('/:id/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser!.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser!.following = currentUser!.following.filter(id => !id.equals(targetUser._id));
      targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUserId));
      
      await currentUser!.save();
      await targetUser.save();

      res.json({
        success: true,
        message: 'User unfollowed successfully',
        data: { 
          following: false,
          followersCount: targetUser.followers.length
        }
      });
    } else {
      // Follow
      currentUser!.following.push(targetUser._id);
      targetUser.followers.push(currentUserId);
      
      await currentUser!.save();
      await targetUser.save();

      // Create notification
      const notification = new Notification({
        userId: targetUser._id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser!.username} started following you`,
        data: { userId: currentUserId }
      });
      await notification.save();

      // Emit real-time notification
      io.to(`user:${targetUser._id}`).emit('notification', notification);

      // Check for follower badges
      await checkBadges(targetUserId);

      res.json({
        success: true,
        message: 'User followed successfully',
        data: { 
          following: true,
          followersCount: targetUser.followers.length
        }
      });
    }
  } catch (error) {
    logger.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's posts
router.get('/:username/posts', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      userId: user._id,
      visibility: { $in: ['public', 'friends'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePicture')
      .populate('challenge', 'title category');

    res.json({
      success: true,
      data: { posts },
      pagination: {
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
});

// Get suggested users
router.get('/suggestions/for-you', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUser = await User.findById(req.user!._id);
    const following = currentUser!.following;

    // Find users with similar interests
    const suggestions = await User.find({
      _id: { $nin: [...following, req.user!._id] },
      interests: { $in: currentUser!.interests },
      isPrivate: false
    })
      .limit(10)
      .select('username profilePicture bio interests followers ecoLevel')
      .sort({ followers: -1, ecoLevel: -1 });

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching suggestions'
    });
  }
});

export default router;
