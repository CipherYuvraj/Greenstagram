import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './utils/database';
import { User } from './models/User';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectToDatabase();

    const path = event.path.replace('/.netlify/functions/posts', '');
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};

    // Authentication helper
    const getAuthenticatedUser = async (authHeader?: string) => {
      if (!authHeader) return null;
      
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return await User.findById(decoded.userId).select('-password');
      } catch {
        return null;
      }
    };

    // Enhanced mock posts data
    const mockPosts = [
      {
        _id: '1',
        userId: {
          _id: 'user1',
          username: 'eco_warrior',
          profilePicture: '',
          isVerified: true
        },
        content: "Just completed my first week of zero waste living! 🌱 It's amazing how much we can reduce our environmental impact with small daily changes. #ZeroWaste #SustainableLiving",
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
            alt: 'Zero waste lifestyle items'
          }
        ],
        hashtags: ['ZeroWaste', 'SustainableLiving', 'EcoFriendly'],
        mentions: [],
        likes: [{ _id: 'like1' }, { _id: 'like2' }],
        comments: [
          {
            _id: 'comment1',
            userId: { _id: 'user2', username: 'green_friend' },
            content: 'This is so inspiring! What was the hardest part?',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        shares: 5,
        isEcoPost: true,
        ecoCategory: 'sustainable-living',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        userId: {
          _id: 'user2',
          username: 'plant_parent',
          profilePicture: '',
          isVerified: false
        },
        content: "My urban garden is thriving! 🌿 Growing your own vegetables is not only rewarding but also helps reduce your carbon footprint. Here's what I harvested today! #UrbanGardening #GrowYourOwn",
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
            alt: 'Urban garden vegetables'
          }
        ],
        hashtags: ['UrbanGardening', 'GrowYourOwn', 'Sustainability'],
        mentions: [],
        likes: [{ _id: 'like3' }],
        comments: [],
        shares: 2,
        isEcoPost: true,
        ecoCategory: 'gardening',
        visibility: 'public',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    switch (`${method} ${path}`) {
      case 'GET /feed':
        const feedType = queryParams.type || 'following';
        const page = parseInt(queryParams.page || '1');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: { posts: mockPosts },
            pagination: { hasMore: page < 2 }
          }),
        };
      
      case 'GET /user':
        const username = queryParams.username;
        const userPosts = username ? mockPosts.filter(post => 
          post.userId.username === username
        ) : mockPosts;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: { posts: userPosts }
          }),
        };

      case 'POST /like':
        // Extract post ID from path or body
        const postIdMatch = path.match(/\/(\w+)\/like$/);
        const postId = postIdMatch ? postIdMatch[1] : null;
        
        if (!postId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Post ID required' }),
          };
        }

        const user = await getAuthenticatedUser(event.headers.authorization);
        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ success: false, message: 'Authentication required' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Post liked successfully'
          }),
        };

      case 'POST /comment':
        const commentPostIdMatch = path.match(/\/(\w+)\/comment$/);
        const commentPostId = commentPostIdMatch ? commentPostIdMatch[1] : null;
        
        if (!commentPostId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Post ID required' }),
          };
        }

        const commentUser = await getAuthenticatedUser(event.headers.authorization);
        if (!commentUser) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ success: false, message: 'Authentication required' }),
          };
        }

        const body = JSON.parse(event.body || '{}');
        if (!body.content) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Comment content required' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Comment added successfully'
          }),
        };

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Posts function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
