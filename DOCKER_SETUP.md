# Docker Setup Instructions

## Prerequisites

- Docker & Docker Compose installed
- Gemini API key (optional, for LLM skill identification)

## Quick Start

### 1. Configure Environment

Copy the environment template:
```bash
cp .env.docker .env
```

Edit `.env` and update `GEMINI_API_KEY` if you have one (optional):
```bash
GEMINI_API_KEY=your_api_key_here
```

### 2. Build & Start Services

```bash
docker-compose up -d
```

This will:
- ✅ Build and start PostgreSQL database
- ✅ Run database migrations automatically
- ✅ Seed initial data (if seed script exists)
- ✅ Build and start backend API (port 3001)
- ✅ Build and start frontend (port 80)

### 3. Verify Everything is Running

```bash
docker-compose ps
```

Expected output:
```
NAME                     COMMAND                CREATED
task-assignment-db       postgres               ... Up (healthy)
task-assignment-backend  npm run start          ... Up
task-assignment-frontend nginx -g daemon off   ... Up
```

### 4. Access the Application

- **Frontend**: http://localhost
- **API**: http://localhost:3001/trpc/*
- **Database**: localhost:5432 (PostgreSQL)

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Clean Up (Remove Volumes)

```bash
docker-compose down -v
```

### Rebuild Services

```bash
docker-compose up -d --build
```

### Access Database

```bash
docker exec -it task-assignment-db psql -U postgres -d task_assignment
```

## Troubleshooting

### Backend can't connect to database

Check the database is healthy:
```bash
docker-compose ps postgres
```

View postgres logs:
```bash
docker-compose logs postgres
```

### Frontend not connecting to backend

Verify backend is running:
```bash
docker-compose logs backend
```

Check nginx config (frontend container):
```bash
docker exec task-assignment-frontend nginx -t
```

### Migrations failed

View backend logs for migration errors:
```bash
docker-compose logs backend | grep -i migration
```

Manually run migrations:
```bash
docker exec task-assignment-backend npm run migrate:prod
```

### Port Already in Use

If ports 80, 3001, or 5432 are in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:80"      # Change frontend to 8080
  - "3002:3001"    # Change backend to 3002
  - "5433:5432"    # Change postgres to 5433
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network           │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐                       │
│  │   Frontend   │ (nginx)               │
│  │  :80         │ Serves React SPA      │
│  └──────────────┘ + Proxies /trpc/*     │
│         │                                │
│         │ http://backend:3001            │
│         ↓                                │
│  ┌──────────────┐                       │
│  │   Backend    │ (Node.js)             │
│  │  :3001       │ tRPC API              │
│  └──────────────┘                       │
│         │                                │
│         │ tcp://postgres:5432            │
│         ↓                                │
│  ┌──────────────┐                       │
│  │  PostgreSQL  │ (Database)            │
│  │  :5432       │ with migrations       │
│  └──────────────┘                       │
│                                          │
└─────────────────────────────────────────┘
```

## Production Considerations

For production deployments:
- Use a container registry (Docker Hub, ECR, etc.)
- Add health checks to all services
- Use secrets management (not env files)
- Add monitoring and logging aggregation
- Configure resource limits (memory, CPU)
- Use a load balancer
- Enable HTTPS/TLS
- Regular backups for database volumes
