# 🐳 NileLink Development Environment

This guide explains how to set up and run the complete NileLink development environment using Docker.

## 🚀 Quick Start

1. **Prerequisites**
   ```bash
   # Install Docker and Docker Compose
   # Windows: https://docs.docker.com/desktop/install/windows/
   # macOS: https://docs.docker.com/desktop/install/mac/
   # Linux: https://docs.docker.com/engine/install/
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd nilelink
   cp .env.development .env
   ```

3. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

5. **Access Applications**
   - **Backend API**: http://localhost:3001
   - **Customer Web App**: http://localhost:3002
   - **POS Web App**: http://localhost:3003
   - **Delivery Web App**: http://localhost:3004
   - **Supplier Web App**: http://localhost:3005
   - **Portal Web App**: http://localhost:3006
   - **Dashboard Web App**: http://localhost:3007
   - **Unified Admin**: http://localhost:3008
   - **Hardhat Network**: http://localhost:8545

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NileLink Development Stack               │
├─────────────────────────────────────────────────────────────┤
│  Web Apps (Next.js)  │  Backend API  │  Smart Contracts     │
│  ├─ Customer         │  ├─ Express   │  ├─ Hardhat Network  │
│  ├─ POS             │  ├─ PostgreSQL │  ├─ Local Blockchain │
│  ├─ Delivery        │  ├─ Redis      │  └─ Contract Tests   │
│  ├─ Supplier        │  ├─ WebSocket  │                      │
│  ├─ Portal          │  └─ Prisma ORM │  Mobile Apps         │
│  ├─ Dashboard       │                │  ├─ React Native     │
│  └─ Unified Admin   │  Infrastructure│  ├─ Offline Sync     │
│                      │  ├─ Docker     │  └─ SQLite           │
└──────────────────────┴────────────────┴─────────────────────┘
```

## 🛠️ Available Services

### Core Infrastructure
- **PostgreSQL**: Primary database (port 5432)
- **Redis**: Caching and session store (port 6379)
- **Hardhat**: Local Ethereum network (port 8545)

### Backend Services
- **Backend API**: Express.js server with TypeScript (port 3001)
  - REST API endpoints
  - WebSocket real-time updates
  - Prisma database ORM
  - JWT authentication

### Web Applications (Next.js)
- **Customer App** (port 3002): Customer-facing ordering platform
- **POS App** (port 3003): Point of sale for restaurants
- **Delivery App** (port 3004): Driver management interface
- **Supplier App** (port 3005): Supplier management system
- **Portal App** (port 3006): Business portal
- **Dashboard App** (port 3007): Analytics dashboard
- **Unified Admin** (port 3008): Administrative interface

## 🏃‍♂️ Development Workflow

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Reset database
docker-compose exec backend npm run db:push

# Open Prisma Studio
docker-compose exec backend npm run db:studio
```

### Smart Contract Development
```bash
# Deploy contracts to local network
docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost

# Run contract tests
docker-compose exec hardhat npx hardhat test

# Access Hardhat console
docker-compose exec hardhat npx hardhat console --network localhost
```

### Mobile Development
```bash
# For mobile development, run services separately
cd mobile/apps/customer
npm start  # This will use the backend API on port 3001

# Or use Expo for React Native development
cd mobile/apps/customer
npm run android  # or ios
```

## 🔧 Configuration

### Environment Variables
- **Development**: `.env.development` (automatically loaded)
- **Production**: `.env` (configure for production deployment)

### Database Connection
- **Host**: `localhost` (from host) or `postgres` (from containers)
- **Database**: `nilelink_dev`
- **Username**: `nilelink`
- **Password**: `nilelink123`

### Networking
All services communicate through the `nilelink-network` Docker network.

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -ano | findstr :3001

   # Change ports in docker-compose.override.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres

   # Reset database
   docker-compose down -v
   docker-compose up -d postgres
   ```

3. **Node Modules Issues**
   ```bash
   # Clear node_modules and rebuild
   docker-compose exec backend rm -rf node_modules
   docker-compose exec backend npm install
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks
```bash
# Check service health
docker-compose ps

# Check specific service logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend
```

## 📊 Monitoring & Debugging

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Export logs
docker-compose logs backend > backend.log
```

### Database Debugging
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U nilelink -d nilelink_dev

# View Redis data
docker-compose exec redis redis-cli
```

### Performance Monitoring
```bash
# View resource usage
docker stats

# Check container disk usage
docker system df
```

## 🚀 Deployment

### Production Deployment
1. Update `.env` with production values
2. Use `docker-compose.prod.yml` for production configuration
3. Set up SSL certificates and domain configuration
4. Configure monitoring and alerting

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy with Docker Compose
        run: |
          docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Contributing

1. Make changes to code
2. Test with `docker-compose up`
3. Ensure all services start successfully
4. Update documentation as needed

For questions or issues, please check the logs or create an issue in the repository.