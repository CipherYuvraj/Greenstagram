#!/bin/bash

# ==========================================
# 🚀 Greenstagram Development Startup Script
# ==========================================

echo "🌱 Starting Greenstagram Development Environment"
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Prerequisites check completed"

# Create environment files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
# ==========================================
# 🔧 Backend Environment Configuration
# ==========================================

# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/greenstagram?authSource=admin

# Redis
REDIS_URL=redis://:redis123@localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
EOF
    echo "✅ Created backend/.env from example"
else
    echo "✅ Backend .env file already exists"
fi

if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=Greenstagram
VITE_ENABLE_DEVTOOLS=true
EOF
    echo "✅ Created frontend/.env"
else
    echo "✅ Frontend .env file already exists"
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

services=("mongodb" "redis" "backend")
for service in "${services[@]}"; do
    if docker-compose ps | grep -q "${service}.*Up.*healthy"; then
        echo "✅ $service is healthy"
    elif docker-compose ps | grep -q "${service}.*Up"; then
        echo "⚠️  $service is running (health check in progress)"
    else
        echo "❌ $service failed to start"
        docker-compose logs $service
    fi
done

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/docs (if implemented)"
echo ""
echo "🗄️  Database Connections:"
echo "   MongoDB: mongodb://admin:password123@localhost:27017/greenstagram"
echo "   Redis:   redis://:redis123@localhost:6379"
echo ""
echo "🛠️  Useful Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop all:     docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Clean reset:  docker-compose down -v && docker-compose up --build"
echo ""
echo "🐞 Troubleshooting:"
echo "   If services fail to start, check logs with: docker-compose logs [service-name]"
echo "   For database issues, try: docker-compose down -v && docker-compose up --build"
