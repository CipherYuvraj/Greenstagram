import express, { Request, Response } from 'express';
import { Challenge } from '../models/challenge';
import { User } from '../models/user';
import Post from '../models/post';
import Notification from '../models/Notification';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateRequest, createChallengeSchema } from '../middleware/validation';
import { checkBadges } from '../utils/badgeTriggers';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

// Get all active challenges (public route)
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const category = req.query.category as string;
        const difficulty = req.query.difficulty as string;
        const skip = (page - 1) * limit;

        const query: any = { status: 'active' };
        
        if (category) {
            query.category = category;
        }
        
        if (difficulty) {
            query.difficulty = difficulty;
        }

        const challenges = await Challenge.find(query)
            .sort({ startDate: -1, participants: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username profilePicture isVerified')
            .select('-submissions');

        // Add just participant count without authentication-specific data
        const challengesWithStatus = challenges.map(challenge => {
            const challengeObj = challenge.toObject();
            challengeObj.participantCount = challenge.participants.length;
            return challengeObj;
        });

        res.json({
            success: true,
            data: { challenges: challengesWithStatus },
            pagination: {
                hasMore: challenges.length === limit
            }
        });
    } catch (error) {
        logger.error('Get challenges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching challenges'
        });
    }
});

// Create challenge (admin only)
router.post('/', authenticate, requireAdmin, validateRequest(createChallengeSchema), async (req: Request, res: Response) => {
  try {
    const challengeData = {
      ...req.body,
      createdBy: (req as any).user._id
    };

    const challenge = new Challenge(challengeData);
    await challenge.save();

    logger.info(`Challenge created: ${challenge.title} by ${(req as any).user.username}`);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge }
    });
  } catch (error) {
    logger.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating challenge'
    });
  }
});

// Get single challenge (public route)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('createdBy', 'username profilePicture isVerified')
            .populate('participants', 'username profilePicture ecoLevel')
            .populate('leaderboard.userId', 'username profilePicture');

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        const challengeObj: any = challenge.toObject();
        
        // Get recent posts for this challenge
        const recentPosts = await Post.find({
            challenge: challenge._id,
            visibility: 'public'
        })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('userId', 'username profilePicture')
            .select('media content likes createdAt');

        challengeObj.recentPosts = recentPosts;

        return res.json({
            success: true,
            data: { challenge: challengeObj }
        });
    } catch (error) {
        logger.error('Get challenge error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching challenge'
        });
    }
});

// Get user's challenge status - new authenticated route
router.get('/:id/status', authenticate, async (req: Request, res: Response) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        const isParticipating = challenge.participants.some(
            participantId => participantId.equals((req as any).user!._id)
        );

        // Get user's submissions for this challenge
        const userSubmissions = challenge.submissions.filter(
            sub => sub.userId.equals((req as any).user!._id)
        );

        // Get user's position in leaderboard if participating
        const leaderboardPosition = isParticipating ? 
            challenge.leaderboard.findIndex(entry => entry.userId.equals((req as any).user!._id)) + 1 : null;

        return res.json({
            success: true,
            data: { 
                isParticipating,
                submissionCount: userSubmissions.length,
                leaderboardPosition,
                participantCount: challenge.participants.length
            }
        });
    } catch (error) {
        logger.error('Get challenge status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching challenge status'
        });
    }
});

// Join challenge
router.post('/:id/join', authenticate, async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not active'
      });
    }

    if (challenge.participants.includes((req as any).user!._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already participating in this challenge'
      });
    }

    // Check if challenge has ended
    if (new Date() > challenge.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Challenge has ended'
      });
    }

    challenge.participants.push((req as any).user!._id);
    await challenge.save();

    // Award points for joining
    await User.findByIdAndUpdate((req as any).user!._id, {
      $inc: { ecoPoints: 10 }
    });

    // Create notification
    const notification = new Notification({
      userId:(req as any).user!._id,
      type: 'challenge',
      title: 'Challenge Joined',
      message: `You joined the challenge: ${challenge.title}`,
      data: { challengeId: challenge._id }
    });
    await notification.save();

    // Check for badges
    await checkBadges((req as any).user!._id.toString());

    // Emit real-time update
    io.emit(`challenge:${challenge._id}:update`, {
      participantCount: challenge.participants.length
    });

    logger.info(`User ${(req as any).user!.username} joined challenge: ${challenge.title}`);

    return res.json({
      success: true,
      message: 'Successfully joined challenge',
      data: {
        participantCount: challenge.participants.length
      }
    });
  } catch (error) {
    logger.error('Join challenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error joining challenge'
    });
  }
});

// Leave challenge
router.post('/:id/leave', authenticate, async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge.participants.includes((req as any).user!._id)) {
      return res.status(400).json({
        success: false,
        message: 'Not participating in this challenge'
      });
    }

    challenge.participants = challenge.participants.filter(
      (participantId) => !participantId.equals((req as any).user!._id)
    );
    await challenge.save();

    // Remove from leaderboard
    challenge.leaderboard = challenge.leaderboard.filter(
      (entry) => !entry.userId.equals((req as any).user!._id)
    );
    await challenge.save();

    return res.json({
      success: true,
      message: 'Successfully left challenge',
      data: {
        participantCount: challenge.participants.length
      }
    });
  } catch (error) {
    logger.error('Leave challenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error leaving challenge'
    });
  }
});

// Get challenge leaderboard (public route)
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('leaderboard.userId', 'username profilePicture ecoLevel isVerified');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Update leaderboard if needed
    // Update leaderboard if needed
    if (typeof (challenge as any).updateLeaderboard === 'function') {
      await (challenge as any).updateLeaderboard();
      await challenge.populate('leaderboard.userId', 'username profilePicture ecoLevel isVerified');
    }

    const leaderboard = challenge.leaderboard.slice(0, 50); // Top 50

    return res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
});

// Submit challenge post
router.post('/:id/submit', authenticate, async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    
    const challenge = await Challenge.findById(req.params.id);
    const post = await Post.findById(postId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.userId.equals((req as any).user!._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own posts'
      });
    }

    if (!challenge.participants.includes((req as any).user!._id)) {
      return res.status(400).json({
        success: false,
        message: 'You must join the challenge first'
      });
    }

    // Check if post is already submitted
    const existingSubmission = challenge.submissions.find(
      (sub) => sub.postId.equals(postId)
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Post already submitted for this challenge'
      });
    }

    // Add submission
    challenge.submissions.push({
      userId: (req as any).user!._id,
      postId: post._id,
      score: calculateSubmissionScore(post),
      verified: false
    } as any);

    await challenge.save();

    // Update post with challenge reference
    post.challenge = challenge._id;
    await post.save();

    // Award challenge points
    const challengePoints = (challenge as any).points ?? 0;
    const pointsEarned = Math.floor(challengePoints * 0.1); // 10% of challenge points
    await User.findByIdAndUpdate((req as any).user!._id, {
      $inc: { ecoPoints: pointsEarned }
    });

    return res.json({
      success: true,
      message: 'Post submitted successfully',
      data: {
        pointsEarned,
        submissionCount: challenge.submissions.length
      }
    });
  } catch (error) {
    logger.error('Submit challenge post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting post'
    });
  }
});

// Helper function to calculate submission score
const calculateSubmissionScore = (post: any): number => {
  const likes = post.likes.length;
  const comments = post.comments.length;
  const mediaBonus = post.media.length > 0 ? 5 : 0;
  const hashtagBonus = post.hashtags.length * 2;
  
  return 10 + likes + (comments * 2) + mediaBonus + hashtagBonus;
};

export default router;
