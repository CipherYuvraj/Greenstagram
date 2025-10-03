import express, { Request, Response } from 'express';
import Post from '@/models/post';
import { User } from '@/models/user';
import {Challenge} from '@/models/challenge';
import { cacheGet, cacheSet } from '@/config/redis';
import logger from '@/utils/logger';

const router = express.Router();

// Search endpoint with filters - public route
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      query,
      type = 'all',
      category,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query as any;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const searchResults: any = {};

    // Cache key for search results
    const cacheKey = `search:${searchQuery}:${type}:${category}:${sortBy}:${page}:${limit}`;
    const cachedResults = await cacheGet(cacheKey);

    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        cached: true
      });
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const postQuery: any = {
        $text: { $search: searchQuery },
        visibility: 'public'
      };

      if (category) {
        postQuery.ecoCategory = category;
      }

      let postSort: any = { score: { $meta: 'textScore' } };
      if (sortBy === 'date') {
        postSort = { createdAt: -1 };
      } else if (sortBy === 'popularity') {
        postSort = { likes: -1, createdAt: -1 };
      }

      const posts = await Post.find(postQuery)
        .sort(postSort)
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('userId', 'username profilePicture isVerified')
        .populate('challenge', 'title category')
        .select('-comments');

      searchResults.posts = posts;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $text: { $search: searchQuery },
        isPrivate: false
      })
        .sort({ score: { $meta: 'textScore' }, followers: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .select('username profilePicture bio followers ecoLevel isVerified');

      searchResults.users = users;
    }

    // Search challenges
    if (type === 'all' || type === 'challenges') {
      const challengeQuery: any = {
        $text: { $search: searchQuery },
        status: 'active'
      };

      if (category) {
        challengeQuery.category = category;
      }

      const challenges = await Challenge.find(challengeQuery)
        .sort({ score: { $meta: 'textScore' }, participants: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('createdBy', 'username profilePicture')
        .select('-submissions -leaderboard');

      searchResults.challenges = challenges;
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      const hashtags = await Post.aggregate([
        {
          $match: {
            hashtags: { $regex: searchQuery, $options: 'i' },
            visibility: 'public'
          }
        },
        {
          $unwind: '$hashtags'
        },
        {
          $match: {
            hashtags: { $regex: searchQuery, $options: 'i' }
          }
        },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 },
            recentPost: { $max: '$createdAt' }
          }
        },
        {
          $sort: { count: -1, recentPost: -1 }
        },
        {
          $limit: parseInt(limit as string)
        },
        {
          $project: {
            hashtag: '$_id',
            count: 1,
            recentPost: 1,
            _id: 0
          }
        }
      ]);

      searchResults.hashtags = hashtags;
    }

    // Cache results for 5 minutes
    await cacheSet(cacheKey, searchResults, 300);

    return res.json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    logger.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Search service error'
    });
  }
});

// Search suggestions endpoint - public route
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q: string };

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const cacheKey = `suggestions:${q}`;
    const cachedSuggestions = await cacheGet(cacheKey);

    if (cachedSuggestions) {
      return res.json({
        success: true,
        data: { suggestions: cachedSuggestions }
      });
    }

    const suggestions: string[] = [];

    // User suggestions
    const users = await User.find({
      username: { $regex: `^${q}`, $options: 'i' },
      isPrivate: false
    })
      .limit(5)
      .select('username');

    suggestions.push(...users.map(user => `@${user.username}`));

    // Hashtag suggestions
    const hashtags = await Post.aggregate([
      {
        $match: {
          hashtags: { $regex: `^${q}`, $options: 'i' },
          visibility: 'public'
        }
      },
      {
        $unwind: '$hashtags'
      },
      {
        $match: {
          hashtags: { $regex: `^${q}`, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    suggestions.push(...hashtags.map(tag => `#${tag._id}`));

    // Challenge suggestions
    const challenges = await Challenge.find({
      title: { $regex: q, $options: 'i' },
      status: 'active'
    })
      .limit(3)
      .select('title');

    suggestions.push(...challenges.map(challenge => challenge.title));

    // Remove duplicates and limit
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10);

    // Cache for 10 minutes
    await cacheSet(cacheKey, uniqueSuggestions, 600);

    return res.json({
      success: true,
      data: { suggestions: uniqueSuggestions }
    });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Suggestions service error'
    });
  }
});

// Trending hashtags endpoint - public route
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'trending:hashtags';
    const cachedTrending = await cacheGet(cacheKey);

    if (cachedTrending) {
      return res.json({
        success: true,
        data: { hashtags: cachedTrending }
      });
    }

    // Get trending hashtags from last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingHashtags = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          visibility: 'public',
          hashtags: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$hashtags'
      },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          recentPost: { $max: '$createdAt' },
          posts: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // At least 2 posts
        }
      },
      {
        $sort: { count: -1, recentPost: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          hashtag: '$_id',
          count: 1,
          recentPost: 1,
          samplePosts: { $slice: ['$posts', 3] },
          _id: 0
        }
      }
    ]);

    // Cache for 30 minutes
    await cacheSet(cacheKey, trendingHashtags, 1800);

    return res.json({
      success: true,
      data: { hashtags: trendingHashtags }
    });
  } catch (error) {
    logger.error('Trending hashtags error:', error);
    return res.status(500).json({
      success: false,
      message: 'Trending service error'
    });
  }
});

export default router;
