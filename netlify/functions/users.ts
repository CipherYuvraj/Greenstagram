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

    const path = event.path.replace('/.netlify/functions/users', '');
    const method = event.httpMethod;

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

    // Mock user profile data
    const mockProfile = {
      _id: 'user1',
      username: 'eco_warrior',
      email: 'eco@example.com',
      profilePicture: '',
      bio: 'Passionate about sustainable living 🌱 Zero waste advocate | Urban gardener | Climate action enthusiast. Making small changes for a big impact! 🌍',
      location: {
        country: 'USA',
        city: 'San Francisco'
      },
      interests: ['Zero Waste', 'Urban Gardening', 'Renewable Energy', 'Climate Action'],
      ecoPoints: 2450,
      ecoLevel: 8,
      currentStreak: 42,
      longestStreak: 89,
      badges: [
        { badgeId: 'eco_warrior', name: 'Eco Warrior', icon: '🌱', category: 'special' },
        { badgeId: 'zero_waste', name: 'Zero Waste Champion', icon: '♻️', category: 'activity' },
        { badgeId: 'streak_30', name: '30 Day Streak', icon: '🔥', category: 'streak' },
        { badgeId: 'gardener', name: 'Urban Gardener', icon: '🌿', category: 'activity' }
      ],
      followers: [],
      following: [],
      isVerified: true,
      isPrivate: false,
      createdAt: new Date('2023-03-15').toISOString(),
      updatedAt: new Date().toISOString()
    };

    switch (`${method} ${path}`) {
      case 'GET /profile':
        // Extract username from path like /profile/username
        const profileMatch = path.match(/\/profile\/(.+)/);
        const requestedUsername = profileMatch ? profileMatch[1] : null;
        
        if (!requestedUsername) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Username required' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: { user: { ...mockProfile, username: requestedUsername } }
          }),
        };

      case 'POST /follow':
        const followMatch = path.match(/\/follow\/(.+)/);
        const followUserId = followMatch ? followMatch[1] : null;
        
        const followUser = await getAuthenticatedUser(event.headers.authorization);
        if (!followUser) {
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
            message: 'User followed successfully'
          }),
        };

      case 'POST /unfollow':
        const unfollowMatch = path.match(/\/unfollow\/(.+)/);
        const unfollowUserId = unfollowMatch ? unfollowMatch[1] : null;
        
        const unfollowUser = await getAuthenticatedUser(event.headers.authorization);
        if (!unfollowUser) {
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
            message: 'User unfollowed successfully'
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
    console.error('Users function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
