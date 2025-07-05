import express from 'express';
import Post from '@/models/Post';
import User from '@/models/User';
import Challenge from '@/models/Challenge';
import Notification from '@/models/Notification';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validateRequest, createPostSchema } from '@/middleware/validation';
import { AuthRequest } from '@/types';
import { checkBadges } from '@/utils/badgeTriggers';
import { io } from '../index';
import logger from '@/utils/logger';

const router = express.Router();

// Create post
router.post('/', authenticate, validateRequest(createPostSchema), async (req: AuthRequest, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user!._id
    };

    const post = new Post(postData);
    await post.save();

    // Award points for posting
    await User.findByIdAndUpdate(req.user!._id, { 
      $inc: { ecoPoints: 10 } 
    });

    // Check for new badges
    await checkBadges(req.user!._id.toString());

    // If post is for a challenge, add submission
    if (req.body.challenge) {
      const challenge = await Challenge.findById(req.body.challenge);
      if (challenge && challenge.isActive) {
        challenge.submissions.push({
          userId: req.user!._id,
          postId: post._id,
          score: 10,
          verified: false
        });
        await challenge.save();
      }
    }

    // Populate post data for response
    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username profilePicture isVerified')
      .populate('challenge', 'title points');

    // Emit real-time update
    io.emit('post:created', populatedPost);

    logger.info(`Post created by user: ${req.user!.username}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
});

// Get feed posts
router.get('/feed', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get posts from followed users and own posts
    const followingIds = req.user!.following;
    const userIds = [req.user!._id, ...followingIds];

    const posts = await Post.find({
      userId: { $in: userIds },
      visibility: { $in: ['public', 'friends'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePicture isVerified')
      .populate('challenge', 'title points category')
      .populate('comments.userId', 'username profilePicture');

    const hasMore = posts.length === limit;

    res.json({
      success: true,
      data: { posts },
      pagination: {
        hasMore,
        nextCursor: hasMore ? posts[posts.length - 1]._id : null
      }
    });
  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feed'
    });
  }
});

// Get trending posts
router.get('/trending', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get posts from last 7 days with high engagement
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          visibility: 'public'
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          engagementScore: {
            $add: [
              { $size: '$likes' },
              { $multiply: [{ $size: '$comments' }, 2] },
              { $multiply: ['$shares', 3] }
            ]
          }
        }
      },
      {
        $sort: { engagementScore: -1, createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
          pipeline: [
            { $project: { username: 1, profilePicture: 1, isVerified: 1 } }
          ]
        }
      },
      {
        $unwind: '$userId'
      }
    ]);

    res.json({
      success: true,
      data: { posts },
      pagination: {
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    logger.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending posts'
    });
  }
});

// Like/unlike post
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user!._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      post.likes.push(userId);
      
      // Award points for liking
      await User.findByIdAndUpdate(userId, { 
        $inc: { ecoPoints: 2 } 
      });

      // Create notification for post owner
      if (!post.userId.equals(userId)) {
        const notification = new Notification({
          userId: post.userId,
          type: 'like',
          title: 'New Like',
          message: `${req.user!.username} liked your post`,
          data: { postId: post._id, userId }
        });
        await notification.save();

        // Emit real-time notification
        io.to(`user:${post.userId}`).emit('notification', notification);
      }
    }

    await post.save();

    res.json({
      success: true,
      data: { 
        liked: !isLiked,
        likesCount: post.likes.length 
      }
    });
  } catch (error) {
    logger.error('Like/unlike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add comment
router.post('/:id/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      userId: req.user!._id,
      content: content.trim(),
      likes: [],
      replies: []
    };

    post.comments.push(comment as any);
    await post.save();

    // Award points for commenting
    await User.findByIdAndUpdate(req.user!._id, { 
      $inc: { ecoPoints: 5 } 
    });

    // Create notification for post owner
    if (!post.userId.equals(req.user!._id)) {
      const notification = new Notification({
        userId: post.userId,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user!.username} commented on your post`,
        data: { postId: post._id, userId: req.user!._id }
      });
      await notification.save();

      // Emit real-time notification
      io.to(`user:${post.userId}`).emit('notification', notification);
    }

    // Populate the new comment
    const updatedPost = await Post.findById(post._id)
      .populate('comments.userId', 'username profilePicture');

    const newComment = updatedPost!.comments[updatedPost!.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username profilePicture isVerified')
      .populate('challenge', 'title points category')
      .populate('comments.userId', 'username profilePicture')
      .populate('mentions', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check visibility permissions
    if (post.visibility === 'private' && (!req.user || !post.userId._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
});

export default router;
