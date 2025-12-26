# NileLink Development Environment Makefile
# Simplifies common development tasks

.PHONY: help build up down logs clean install migrate test deploy

# Default target
help: ## Show this help message
	@echo "🐳 NileLink Development Environment"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Build all services
build: ## Build all Docker services
	docker-compose build

# Start development environment
up: ## Start all services in detached mode
	docker-compose up -d

# Start with logs (for debugging)
up-logs: ## Start all services with logs
	docker-compose up

# Stop all services
down: ## Stop all services
	docker-compose down

# View logs
logs: ## Show logs for all services
	docker-compose logs -f

# View logs for specific service
logs-%: ## Show logs for specific service (e.g., make logs-backend)
	docker-compose logs -f $*

# Restart specific service
restart-%: ## Restart specific service (e.g., make restart-backend)
	docker-compose restart $*

# Database operations
db-migrate: ## Run database migrations
	docker-compose exec backend npm run db:migrate

db-push: ## Push database schema (reset database)
	docker-compose exec backend npm run db:push

db-studio: ## Open Prisma Studio
	docker-compose exec backend npm run db:studio

db-seed: ## Seed database with initial data
	docker-compose exec backend npm run db:seed

# Smart contract operations
contracts-compile: ## Compile smart contracts
	docker-compose exec hardhat npx hardhat compile

contracts-test: ## Run smart contract tests
	docker-compose exec hardhat npx hardhat test

contracts-deploy: ## Deploy contracts to local network
	docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost

# Testing
test: ## Run all tests
	docker-compose exec backend npm test

test-watch: ## Run tests in watch mode
	docker-compose exec backend npm run test:watch

test-integration: ## Run integration tests
	docker-compose exec backend npm run test:integration

# Installation
install: ## Install dependencies for all services
	docker-compose exec backend npm install
	@echo "Note: Run 'make install-web' to install web app dependencies"

install-web: ## Install dependencies for web apps
	@echo "Installing dependencies for all web apps..."
	docker-compose exec web-customer npm install
	docker-compose exec web-pos npm install
	docker-compose exec web-delivery npm install
	docker-compose exec web-supplier npm install
	docker-compose exec web-portal npm install
	docker-compose exec web-dashboard npm install
	docker-compose exec web-unified npm install

# Cleanup
clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

clean-volumes: ## Remove all volumes (WARNING: This deletes all data)
	docker-compose down -v

clean-images: ## Remove all Docker images
	docker system prune -a --volumes

# Health checks
health: ## Check health of all services
	docker-compose ps
	@echo ""
	@echo "Service Health Checks:"
	@echo "PostgreSQL: " $(shell docker-compose exec -T postgres pg_isready -U nilelink -d nilelink_dev 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy")
	@echo "Redis: " $(shell docker-compose exec -T redis redis-cli ping 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy")
	@echo "Backend: " $(shell curl -f http://localhost:3001/health 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy")

# Development shortcuts
backend-shell: ## Open shell in backend container
	docker-compose exec backend sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U nilelink -d nilelink_dev

redis-shell: ## Open Redis shell
	docker-compose exec redis redis-cli

hardhat-shell: ## Open Hardhat console
	docker-compose exec hardhat npx hardhat console --network localhost

# Full development setup
setup: ## Complete development environment setup
	@echo "🚀 Setting up NileLink development environment..."
	@echo "Step 1: Building services..."
	make build
	@echo "Step 2: Starting services..."
	make up
	@echo "Step 3: Waiting for database..."
	sleep 10
	@echo "Step 4: Running migrations..."
	make db-migrate
	@echo "Step 5: Checking health..."
	make health
	@echo ""
	@echo "🎉 Setup complete!"
	@echo "Access your applications:"
	@echo "  Backend API: http://localhost:3001"
	@echo "  Customer App: http://localhost:3002"
	@echo "  POS App: http://localhost:3003"
	@echo "  ...and more (see DOCKER_README.md)"

# Production deployment (placeholder)
deploy: ## Deploy to production (configure docker-compose.prod.yml first)
	@echo "⚠️  Production deployment not configured yet"
	@echo "Create docker-compose.prod.yml and configure production environment"
	@echo "See DOCKER_README.md for deployment instructions"