import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './utils/database';
import { User } from './models/User';

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
    await connectToDatabase();

    const path = event.path.replace('/.netlify/functions/auth', '');
    const method = event.httpMethod;

    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};

    switch (`${method} ${path}`) {
      case 'POST /register':
        return await handleRegister(body);
      case 'POST /login':
        return await handleLogin(body);
      case 'GET /me':
        return await handleGetMe(event.headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
    };
  }
};

async function handleRegister(body: any) {
  const { username, email, password, confirmPassword } = body;

  // Validation
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

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      }),
    };
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    ecoPoints: 50,
    ecoLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActive: new Date(),
    isPrivate: false,
    isVerified: false,
    badges: [],
    followers: [],
    following: [],
    interests: []
  });

  await user.save();

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          ecoLevel: user.ecoLevel,
          ecoPoints: user.ecoPoints
        }
      }
    }),
  };
}

async function handleLogin(body: any) {
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

  // Find user
  const user = await User.findOne({
    $or: [
      { email: emailOrUsername },
      { username: emailOrUsername }
    ]
  });

  if (!user) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      }),
    };
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      }),
    };
  }

  // Update last active
  user.lastActive = new Date();
  await user.save();

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          ecoLevel: user.ecoLevel,
          ecoPoints: user.ecoPoints,
          currentStreak: user.currentStreak,
          isPrivate: user.isPrivate
        }
      }
    }),
  };
}

async function handleGetMe(headers: any) {
  const authHeader = headers.authorization || headers.Authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Access denied. No token provided.'
      }),
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid token. User not found.'
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: { user }
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Invalid token.'
      }),
    };
  }
}
