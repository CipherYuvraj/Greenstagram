#!/bin/bash

# Create necessary directories
mkdir -p .docker/mongodb/initdb.d

# Create MongoDB initialization script
cat > .docker/mongodb/initdb.d/01-init.js << 'EOL'
// MongoDB initialization script for Greenstagram
db = db.getSiblingDB('greenstagram');

// Create collections with initial data
db.createCollection('users');
db.createCollection('posts');
db.createCollection('challenges');
db.createCollection('badges');
db.createCollection('ecoquotes');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "author": 1 });
db.challenges.createIndex({ "startDate": 1, "endDate": 1 });

// Insert sample data for development
db.challenges.insertMany([
  {
    title: "Plant a Tree",
    description: "Plant a tree in your community",
    points: 100,
    difficulty: "medium",
    category: "environment",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Zero Waste Day",
    description: "Go a full day without creating any waste",
    points: 75,
    difficulty: "hard",
    category: "sustainability",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
]);

print('✅ MongoDB initialized successfully!');
EOL

# Create docker-compose.override.yml for development
cat > docker-compose.override.yml << 'EOL'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: greenstagram-mongodb-dev
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: greenstagram_admin
      MONGO_INITDB_ROOT_PASSWORD: greenstagram_password
      MONGO_INITDB_DATABASE: greenstagram
    ports:
      - "27017:27017"
    volumes:
      - ./.docker/mongodb/data:/data/db
      - ./.docker/mongodb/initdb.d:/docker-entrypoint-initdb.d:ro

  redis:
    image: redis:7-alpine
    container_name: greenstagram-redis-dev
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass greenstagram_redis_pass
    ports:
      - "6379:6379"
    volumes:
      - ./.docker/redis/data:/data

  backend:
    build:
      context: .
      dockerfile: .docker/backend/Dockerfile.dev
    container_name: greenstagram-backend-dev
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      PORT: 5000
      MONGODB_URI: mongodb://greenstagram_admin:greenstagram_password@mongodb:27017/greenstagram?authSource=admin
      REDIS_URL: redis://:greenstagram_redis_pass@redis:6379
      JWT_SECRET: development-jwt-secret-key-for-local-use-only
      FRONTEND_URL: http://localhost:3000
      CORS_ORIGIN: http://localhost:3000
    volumes:
      - ./backend:/app/backend
      - /app/backend/node_modules
    depends_on:
      - mongodb
      - redis

  frontend:
    build:
      context: .
      dockerfile: .docker/frontend/Dockerfile.dev
    container_name: greenstagram-frontend-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app/frontend
      - /app/frontend/node_modules
    environment:
      VITE_API_URL: http://localhost:5000
    depends_on:
      - backend

volumes:
  mongodb_data:
  redis_data:
EOL

# Create .dockerignore
cat > .dockerignore << 'EOL'
node_modules
npm-debug.log
.git
.gitignore
README.md
Dockerfile*
docker-compose*
coverage
.nyc_output
dist
build
logs
*.log
.DS_Store
thumbs.db
EOL

# Create Dockerfile for backend development
mkdir -p .docker/backend
cat > .docker/backend/Dockerfile.dev << 'EOL'
FROM node:18-alpine

WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start development server with hot reload
CMD ["npm", "run", "dev"]
EOL

# Create Dockerfile for frontend development
mkdir -p .docker/frontend
cat > .docker/frontend/Dockerfile.dev << 'EOL'
FROM node:18-alpine

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOL

echo "✅ Development environment setup complete!"
echo "To start the development environment, run:"
echo "docker-compose up --build"

# Make the script executable
chmod +x setup-dev.sh
