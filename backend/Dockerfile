# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build args from docker-compose
ARG DB_USER=build
ARG DB_PASSWORD=build
ARG DB_HOST=localhost
ARG DB_PORT=5432
ARG DB_NAME=build

# Set as env vars so prisma generate can use them
ENV DB_USER=${DB_USER} DB_PASSWORD=${DB_PASSWORD} DB_HOST=${DB_HOST} DB_PORT=${DB_PORT} DB_NAME=${DB_NAME}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (must run before building TypeScript so generated client types exist)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev: prisma, tsx needed for migrations)
RUN npm install

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# Link generated to node_modules so it can be resolved as a package
RUN ln -s /app/generated /app/node_modules/generated

# Copy prisma schema, migrations, and config
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

# Expose port
EXPOSE 3001

# Health check - simple TCP check to port 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD sh -c 'nc -z localhost 3001 || exit 1'

# Start application with migrations and seed
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npx tsx src/index.ts"]
