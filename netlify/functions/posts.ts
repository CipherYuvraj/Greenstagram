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

    // Mock posts data for now
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
        media: [],
        hashtags: ['ZeroWaste', 'SustainableLiving', 'EcoFriendly'],
        mentions: [],
        likes: [{ _id: 'like1' }, { _id: 'like2' }],
        comments: [{ _id: 'comment1' }],
        shares: 5,
        isEcoPost: true,
        ecoCategory: 'sustainable-living',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    switch (`${method} ${path}`) {
      case 'GET /feed':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: { posts: mockPosts },
            pagination: { hasMore: false }
          }),
        };
      
      case 'GET /user':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: { posts: mockPosts }
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
