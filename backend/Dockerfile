# Backend Dockerfile for NileLink API Server
FROM node:18-slim AS base

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for building native modules)
RUN npm ci && npm cache clean --force



# Copy source code
COPY . .

# Build the application (temporarily disabled for quick setup)
# RUN npm run build

# Production stage
FROM node:18-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy application from base stage (source code for now)
COPY --from=base --chown=nextjs:nodejs /app/package*.json ./
COPY --from=base --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nextjs:nodejs /app/src ./src
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application (dev mode for now)
CMD ["npm", "run", "dev"]