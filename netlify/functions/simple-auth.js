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
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Invalid JSON in request body' 
          }),
        };
      }
    }

    console.log('Parsed body:', body);

    switch (`${method} ${path}`) {
      case 'POST /register':
        return await handleRegister(body);
      case 'POST /login':
        return await handleLogin(body);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: `Endpoint not found: ${method} ${path}` }),
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
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

async function handleRegister(body) {
  try {
    console.log('Register request body:', body);
    
    const { username, email, password, confirmPassword, bio, interests } = body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      console.log('Missing required fields');
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
      console.log('Passwords do not match');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Passwords do not match'
        }),
      };
    }

    if (password.length < 6) {
      console.log('Password too short');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Password must be at least 6 characters long'
        }),
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email format'
        }),
      };
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
        }),
      };
    }

    console.log('Validation passed, creating mock user');

    // For now, just return success without database (mock implementation)
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-testing';
    
    // Hash password for demonstration (even though we're not storing it)
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const token = jwt.sign(
      { 
        userId: mockUserId,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim()
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated successfully');

    const responseData = {
      success: true,
      message: 'User registered successfully (mock)',
      data: {
        token,
        user: {
          id: mockUserId,
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          ecoLevel: 1,
          ecoPoints: 50,
          currentStreak: 0,
          isPrivate: false,
          bio: bio || '',
          interests: interests || [],
          createdAt: new Date().toISOString()
        }
      }
    };

    console.log('Registration successful, returning response');

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Registration failed',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}

async function handleLogin(body) {
  try {
    console.log('Login request body:', body);
    
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

    // Mock login for testing - in real implementation, check against database
    console.log('Processing mock login');
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-testing';
    const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const token = jwt.sign(
      { 
        userId: mockUserId,
        username: 'testuser',
        email: emailOrUsername.includes('@') ? emailOrUsername : 'test@example.com'
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const responseData = {
      success: true,
      message: 'Login successful (mock)',
      data: {
        token,
        user: {
          id: mockUserId,
          username: 'testuser',
          email: emailOrUsername.includes('@') ? emailOrUsername : 'test@example.com',
          ecoLevel: 1,
          ecoPoints: 50,
          currentStreak: 0,
          isPrivate: false
        }
      }
    };

    console.log('Login successful, returning response');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Login failed',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}
