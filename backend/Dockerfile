# Dockerfile for NileLink Backend API v1.0.0
# Production-optimized multi-stage build

# ============================================================================
# Stage 1: Base Image
# ============================================================================
FROM node:18-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    postgresql-client \
    curl

WORKDIR /app

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base AS deps

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
# Use --legacy-peer-deps to handle Hardhat conflicts (not needed in prod)
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# ============================================================================
# Stage 3: Builder
# ============================================================================
FROM base AS builder

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 4: Production Runner
# ============================================================================
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nilelink

# Copy production dependencies
COPY --from=deps --chown=nilelink:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nilelink:nodejs /app/dist ./dist
COPY --from=builder --chown=nilelink:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nilelink:nodejs /app/package*.json ./

# Switch to non-root user
USER nilelink

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/system/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["npm", "run", "start:prod"]