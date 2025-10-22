# Greenstagram Development with Docker

This guide explains how to set up a local development environment for Greenstagram using Docker.

## Prerequisites

- Docker Desktop (or Docker Engine) installed
- Docker Compose
- Node.js (for local development without Docker)

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/your-username/Greenstagram.git
   cd Greenstagram
   ```

2. **Set up the development environment**:
   ```bash
   ./setup-dev.sh
   ```

3. **Start the development environment**:
   ```bash
   docker-compose up --build
   ```

## Services

The development environment includes the following services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## Development Workflow

### Running Services

- Start all services:
  ```bash
  docker-compose up
  ```

- Start in detached mode:
  ```bash
  docker-compose up -d
  ```

- View logs:
  ```bash
  docker-compose logs -f
  ```

### Stopping Services

- Stop all services:
  ```bash
  docker-compose down
  ```

- Stop and remove volumes:
  ```bash
  docker-compose down -v
  ```

## Environment Variables

### Backend

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://greenstagram_admin:greenstagram_password@mongodb:27017/greenstagram?authSource=admin
REDIS_URL=redis://:greenstagram_redis_pass@redis:6379
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
```

## Database Management

### MongoDB

- **Username**: `greenstagram_admin`
- **Password**: `greenstagram_password`
- **Database**: `greenstagram`

To connect to MongoDB shell:
```bash
docker exec -it greenstagram-mongodb-dev mongosh -u greenstagram_admin -p greenstagram_password --authenticationDatabase admin greenstagram
```

### Redis

- **Password**: `greenstagram_redis_pass`

To connect to Redis CLI:
```bash
docker exec -it greenstagram-redis-dev redis-cli -a greenstagram_redis_pass
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Ensure ports 3000, 5000, 27017, and 6379 are not in use by other services.

2. **Permission issues**:
   - On Linux, you might need to run Docker commands with `sudo` or add your user to the `docker` group.

3. **Container not starting**:
   - Check logs: `docker-compose logs [service_name]`
   - Rebuild containers: `docker-compose up --build`

### Resetting the Environment

To completely reset the development environment:

```bash
docker-compose down -v
rm -rf .docker
./setup-dev.sh
docker-compose up --build
```

## Production Deployment

For production deployment, refer to the main [DEPLOYMENT.md](DEPLOYMENT.md) file.

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file for details.
