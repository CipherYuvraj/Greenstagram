# 🐳 Docker Development Setup for Greenstagram

This document explains how to set up the complete Greenstagram development environment using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### Option 1: Automated Setup

Make the startup script executable
chmod +x start-dev.sh
Start the complete development environment
./start-dev.sh

### Option 2: Manual Setup

1. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env # if exists
2. Start all services
docker-compose up --build -d
3. Check service health
docker-compose ps

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React development server |
| Backend | 5000 | Node.js API server |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache & session storage |

## Default Credentials

### MongoDB
- **URL:** `mongodb://admin:password123@localhost:27017/greenstagram`
- **Username:** `admin`
- **Password:** `password123`
- **Database:** `greenstagram`

### Redis
- **URL:** `redis://:redis123@localhost:6379`
- **Password:** `redis123`

## Useful Commands

View logs for all services
docker-compose logs -f
View logs for specific service
docker-compose logs -f backend
Restart a service
docker-compose restart backend
Stop all services
docker-compose down
Complete cleanup (removes volumes)
docker-compose down -v
Rebuild and restart
docker-compose up --build --force-recreate

## Development Workflow

1. **Start Environment:** `./start-dev.sh`  or `docker-compose up -d`
2. **Make Changes:** Edit code in `frontend/`  or `backend/`  directories
3. **View Changes:** Changes are automatically reflected (hot reload)
4. **Check Logs:** `docker-compose logs -f [service-name]`
5. **Stop Environment:** `docker-compose down`

## Troubleshooting

### Port Conflicts
If you get port conflict errors:

Check what's using the ports
lsof -i :3000
lsof -i :5000
lsof -i :27017
lsof -i :6379
Kill conflicting processes
kill -9 <PID>

### Database Issues

Reset database completely
docker-compose down -v
docker-compose up --build -d

### Permission Issues (macOS/Linux)

Fix file permissions
chmod +x start-dev.sh
sudo chown -R $(whoami) .

## Contributing

When contributing to this project:

1. Ensure Docker environment works: `./start-dev.sh`
2. Test your changes in the containerized environment
3. Update this documentation if you modify Docker configuration
4. Include Docker-related changes in your PR

## Issue Resolution

This Docker setup resolves **Issue #21**: "Containerize backend with Redis and MongoDB for easy development"

### Benefits Achieved:
✅ Single command startup (`docker-compose up` )
✅ Consistent development environment
✅ Eliminates manual MongoDB/Redis setup
✅ Version consistency across all developers
✅ Simplified onboarding for new contributors

### Hacktoberfest 2025 Contribution
This containerization setup significantly improves the developer experience and addresses the key pain points mentioned in the issue.
