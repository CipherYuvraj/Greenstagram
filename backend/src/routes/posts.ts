import express, { Request, Response } from 'express';
import Post from '../models/post';
import { User }from '../models/user';
import {Challenge} from '../models/challenge';
import Notification from '../models/Notification';
import { authenticate} from '../middleware/auth';
import { validateRequest, createPostSchema } from '../middleware/validation';
import { AuthRequest } from '../types';
import { checkBadges } from '../utils/badgeTriggers';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

// Create post
router.post('/', authenticate, validateRequest(createPostSchema), async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const postData = {
      ...authReq.body,
      userId: authReq.user!._id
    };

    const post = new Post(postData);
    await post.save();
    // Award points for posting
    await User.findByIdAndUpdate(authReq.user!._id, { 
      $inc: { ecoPoints: 10 } 
    });

    // Check for new badges
    await checkBadges(authReq.user!._id.toString());

    // If post is for a challenge, add submission
    if (authReq.body && (authReq.body as any).challenge) {
      const challenge = await Challenge.findById((authReq.body as any).challenge);
      if (challenge && challenge.isActive) {
        challenge.submissions.push({
          userId: authReq.user!._id,
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
    logger.info(`Post created by user: ${authReq.user!.username}`);

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
router.get('/feed', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get posts from followed users and own posts
    const followingIds = (req as any).user!.following;
    const userIds = [(req as any).user!._id, ...followingIds];

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
router.get('/trending', async (req: Request, res: Response) => {
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
router.post('/:id/like', authenticate, async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = (req as any).user!._id;
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
          message: `${(req as any).user!.username} liked your post`,
          data: { postId: post._id, userId }
        });
        await notification.save();

        // Emit real-time notification
        io.to(`user:${post.userId}`).emit('notification', notification);
      }
    }

    await post.save();

    return res.json({
      success: true,
      data: { 
        liked: !isLiked,
        likesCount: post.likes.length 
      }
    });
  } catch (error) {
    logger.error('Like/unlike post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add comment
router.post('/:id/comment', authenticate, async (req: Request, res: Response) => {
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
      userId: (req as any).user!._id,
      content: content.trim(),
      likes: [],
      replies: []
    };

    post.comments.push(comment as any);
    await post.save();

    // Award points for commenting
    await User.findByIdAndUpdate((req as any).user!._id, { 
      $inc: { ecoPoints: 5 } 
    });

    // Create notification for post owner
    if (!post.userId.equals((req as any).user!._id)) {
      const notification = new Notification({
        userId: post.userId,
        type: 'comment',
        title: 'New Comment',
        message: `${(req as any).user!.username} commented on your post`,
        data: { postId: post._id, userId: (req as any).user!._id }
      });
      await notification.save();

      // Emit real-time notification
      io.to(`user:${post.userId}`).emit('notification', notification);
    }

    // Populate the new comment
    const updatedPost = await Post.findById(post._id)
      .populate('comments.userId', 'username profilePicture');

    const newComment = updatedPost!.comments[updatedPost!.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
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

        // Only show public posts when not authenticated
        if (post.visibility !== 'public') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        return res.json({
            success: true,
            data: { post }
        });
    } catch (error) {
        logger.error('Get post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching post'
        });
    }
});

export default router;
