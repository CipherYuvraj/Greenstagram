import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify function is working!',
        timestamp: new Date().toISOString(),
        event: {
          httpMethod: event.httpMethod,
          path: event.path,
          headers: event.headers,
          queryStringParameters: event.queryStringParameters
        },
        environment: {
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasMongoString: !!process.env.MONGODB_CONNECTION_STRING,
          nodeEnv: process.env.NODE_ENV
        }
      }),
    };
  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Test function failed',
        error: error.message
      }),
    };
  }
};
