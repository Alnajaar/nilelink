#!/bin/bash

# NileLink Backend Startup Script
# This script handles database migrations and application startup

set -e

echo "🚀 Starting NileLink Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
  sleep 1
done
echo "✅ Database is ready!"

# Run database migrations
echo "📦 Running database migrations..."
npm run prisma:deploy

# Generate Prisma client (in case of updates)
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run database seeds (for development)
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding database..."
  npm run prisma:seed
fi

# Health check before starting
echo "🏥 Running pre-start health checks..."
# Add any pre-start checks here

echo "🎯 Starting application server..."
exec npm start