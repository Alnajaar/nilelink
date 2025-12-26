-- NileLink Database Initialization
-- This file runs when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist
-- (This is handled by POSTGRES_DB in docker-compose.yml)

-- Set up initial configuration
-- This will be populated by Prisma migrations when the backend starts