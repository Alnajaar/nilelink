# NileLink Protocol - Complete Developer Setup Guide

## 🚀 Welcome to NileLink

This guide will get you from zero to a fully functional NileLink ecosystem in under 30 minutes.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **Docker**: 20.0+ with docker-compose
- **Git**: Latest stable version
- **Code Editor**: VS Code recommended
- **OS**: macOS, Linux, or Windows (WSL2)

### Development Tools
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Docker
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Linux: https://docs.docker.com/engine/install/
# Windows: https://docs.docker.com/desktop/install/windows-install/

# Verify installations
node --version     # Should show v18.x.x
npm --version      # Should show 9.x.x
docker --version   # Should show 20.x.x
docker-compose --version
```

---

## 🏗️ Quick Start (3 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/nilelink.git
cd nilelink
```

### 2. Environment Setup
```bash
# Copy environment templates
cp .env.development .env

# Edit with your configuration
nano .env
```

### 3. Launch Everything
```bash
# Start all services
make dev

# Or manually:
docker-compose up -d postgres redis
npm run setup:all
npm run dev:all
```

### 4. Verify Setup
```bash
# Check services are running
curl http://localhost:3000/health
curl http://localhost:3001/health  # Customer app
curl http://localhost:3002/health  # POS app

# Run tests
npm test
```

---

## 🔧 Detailed Setup

### Backend API Server

#### 1. Database Setup
```bash
cd backend

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed

# Start development server
npm run dev
```

#### 2. Environment Configuration
```bash
# backend/.env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/nilelink"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-here"
CORS_ORIGIN="http://localhost:3001,http://localhost:3002"
```

#### 3. Verify Backend
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test API endpoints
curl http://localhost:3000/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

### Mobile Applications

#### Customer App Setup
```bash
cd mobile/apps/customer

# Install dependencies
npm install

# For iOS development (macOS only)
cd ios && pod install && cd ..

# Start development server
npm run ios    # iOS simulator
npm run android # Android emulator
npm run web    # Web browser
```

#### POS App Setup
```bash
cd mobile/apps/pos

# Install dependencies
npm install

# Start development server
npm run ios
npm run android
npm run web
```

#### Sync Engine Setup
```bash
cd mobile/packages/sync-engine

# Install dependencies
npm install

# Build package
npm run build
```

### Web Applications

#### Portal Setup
```bash
cd web/portal
npm install
npm run dev
# Access: http://localhost:3003
```

#### POS Terminal Setup
```bash
cd web/pos
npm install
npm run dev
# Access: http://localhost:3002
```

---

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend && npm test

# Mobile tests
cd mobile && npm test

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration
```

### Test Individual Components
```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend integration tests
cd backend && npm run test:integration

# Mobile unit tests
cd mobile/apps/customer && npm test

# Contract tests
cd contracts && npm test
```

---

## 🔒 Security Configuration

### JWT & Authentication
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Update environment
JWT_SECRET="your-generated-secret-here"
```

### Database Security
```bash
# Create database user
CREATE USER nilelink_user WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE nilelink TO nilelink_user;

# Update connection string
DATABASE_URL="postgresql://nilelink_user:secure-password@localhost:5432/nilelink"
```

### API Keys (for external services)
```bash
# Magic SDK (Web3 Auth)
MAGIC_API_KEY="your-magic-api-key"

# Polygon RPC
POLYGON_RPC_URL="https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 🚢 Deployment

### Development Deployment
```bash
# Start all services
docker-compose up -d

# Deploy backend
cd backend && npm run build && npm start

# Deploy mobile apps
cd mobile/apps/customer && npm run build
cd mobile/apps/pos && npm run build
```

### Production Deployment
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Deploy to cloud (example: Railway, Render, etc.)
npm run deploy:production
```

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://host:6379"
JWT_SECRET="production-secret-key"
CORS_ORIGIN="https://yourdomain.com"
SSL_CERT_PATH="/path/to/cert.pem"
SSL_KEY_PATH="/path/to/key.pem"
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check database connection
cd backend && npm run prisma:studio

# Check environment variables
cat .env | grep DATABASE_URL

# Check logs
docker-compose logs backend
```

#### Mobile App Build Fails
```bash
# Clear cache
cd mobile && rm -rf node_modules && npm install

# For iOS
cd mobile/apps/customer/ios && pod install --repo-update

# Check Xcode version (iOS)
xcodebuild -version
```

#### Database Migration Issues
```bash
# Reset database (development only)
cd backend && npm run prisma:migrate:reset

# Check migration status
npm run prisma:migrate:status

# Apply migrations manually
npm run prisma:migrate:deploy
```

#### Sync Engine Issues
```bash
# Check sync status
curl http://localhost:3000/api/sync/status

# Clear sync queue (development only)
# Use database client to truncate sync_queue table
```

### Performance Issues
```bash
# Check memory usage
docker stats

# Check database performance
cd backend && npm run prisma:studio

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health
```

### Network Issues
```bash
# Check service connectivity
docker-compose ps

# Test API endpoints
curl -v http://localhost:3000/health

# Check database connectivity
docker exec -it nilelink_postgres pg_isready
```

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Security Checklist](./Security_Checklist.md)

### Learning Resources
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Prisma Docs](https://www.prisma.io/docs)
- [Redux Saga Docs](https://redux-saga.js.org/)
- [Hardhat Docs](https://hardhat.org/docs)

### Community & Support
- [GitHub Issues](https://github.com/your-org/nilelink/issues)
- [Discord Community](https://discord.gg/nilelink)
- [Developer Forum](https://forum.nilelink.app)

---

## 🎯 Next Steps

1. **Explore the codebase** - Start with `backend/src/app.ts`
2. **Run the tests** - `npm test` in each component
3. **Build a feature** - Try adding a new API endpoint
4. **Deploy locally** - Use `docker-compose up`
5. **Join the community** - Contribute to the project!

---

## 📞 Support

Need help? We're here to support you:

- **Documentation**: Check this guide first
- **Issues**: [GitHub Issues](https://github.com/your-org/nilelink/issues)
- **Community**: [Discord](https://discord.gg/nilelink)
- **Email**: dev-support@nilelink.app

**Happy coding with NileLink! 🚀**
