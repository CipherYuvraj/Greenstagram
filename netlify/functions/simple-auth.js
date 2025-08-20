const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/simple-auth', '');
    const method = event.httpMethod;
    
    console.log('Simple Auth - Method:', method, 'Path:', path);

    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};

    switch (`${method} ${path}`) {
      case 'POST /register':
        return await handleRegister(body);
      case 'POST /login':
        return await handleLogin(body);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Simple auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error.message
      }),
    };
  }
};

async function handleRegister(body) {
  try {
    const { username, email, password, confirmPassword } = body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'All fields are required'
        }),
      };
    }

    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Passwords do not match'
        }),
      };
    }

    // For now, just return success without database
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { 
        userId: 'mock-user-id',
        username: username,
        email: email 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully (mock)',
        data: {
          token,
          user: {
            id: 'mock-user-id',
            username: username,
            email: email,
            ecoLevel: 1,
            ecoPoints: 50,
            currentStreak: 0,
            isPrivate: false
          }
        }
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Registration failed',
        error: error.message
      }),
    };
  }
}

async function handleLogin(body) {
  try {
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email/username and password are required'
        }),
      };
    }

    // Mock login for testing
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { 
        userId: 'mock-user-id',
        username: 'testuser',
        email: 'test@example.com'
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login successful (mock)',
        data: {
          token,
          user: {
            id: 'mock-user-id',
            username: 'testuser',
            email: 'test@example.com',
            ecoLevel: 1,
            ecoPoints: 50,
            currentStreak: 0,
            isPrivate: false
          }
        }
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Login failed',
        error: error.message
      }),
    };
  }
}
