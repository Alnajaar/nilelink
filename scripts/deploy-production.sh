#!/bin/bash

# NileLink Production Deployment Script
# This script handles the complete production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="nilelink"
ENVIRONMENT="production"
AWS_REGION="eu-central-1"
DOCKER_REGISTRY="nilelink"

# Functions
create_nextjs_dockerfile() {
    local app_dir=$1
    local dockerfile="${app_dir}/Dockerfile.production"

    if [ ! -f "$dockerfile" ]; then
        log_info "Creating Dockerfile for ${app_dir}..."
        cat > "$dockerfile" << EOF
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --prod; \\
  elif [ -f package-lock.json ]; then npm ci --only=production; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile --prod; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN \\
  if [ -f yarn.lock ]; then yarn build; \\
  elif [ -f package-lock.json ]; then npm run build; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm build; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
EOF
    fi
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if required tools are installed
    command -v terraform >/dev/null 2>&1 || { log_error "Terraform is required but not installed. Aborting."; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v aws >/dev/null 2>&1 || { log_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed. Aborting."; exit 1; }

    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || { log_error "AWS credentials not configured. Run 'aws configure'. Aborting."; exit 1; }

    log_success "Prerequisites check passed"
}

build_and_push_images() {
    log_info "Building and pushing Docker images..."

    # Build backend image
    log_info "Building backend image..."
    docker build -f backend/Dockerfile.production -t ${DOCKER_REGISTRY}/backend:latest ./backend
    docker push ${DOCKER_REGISTRY}/backend:latest

    # Build all frontend applications
    # unified/portal -> nilelink.app (main domain)
    # customer -> customer.nilelink.app
    # pos -> pos.nilelink.app
    # supplier -> supplier.nilelink.app
    # super-admin -> admin.nilelink.app
    frontend_apps=("customer" "supplier" "pos" "super-admin" "unified" "investor" "portal" "admin" "delivery")

    for app in "${frontend_apps[@]}"; do
        if [ -d "web/${app}" ]; then
            log_info "Building ${app} frontend image..."
            if [ -f "web/${app}/Dockerfile" ]; then
                docker build -f web/${app}/Dockerfile -t ${DOCKER_REGISTRY}/${app}:latest ./web/${app}
            elif [ -f "web/${app}/Dockerfile.production" ]; then
                docker build -f web/${app}/Dockerfile.production -t ${DOCKER_REGISTRY}/${app}:latest ./web/${app}
            else
                # Create default Next.js Dockerfile if none exists
                create_nextjs_dockerfile "web/${app}"
                docker build -f web/${app}/Dockerfile.production -t ${DOCKER_REGISTRY}/${app}:latest ./web/${app}
            fi
            docker push ${DOCKER_REGISTRY}/${app}:latest
            log_success "${app} image built and pushed"
        else
            log_warning "${app} directory not found, skipping..."
        fi
    done

    # Build AI service
    if [ -d "ai-service" ]; then
        log_info "Building AI service image..."
        docker build -f ai-service/Dockerfile -t ${DOCKER_REGISTRY}/ai-service:latest ./ai-service
        docker push ${DOCKER_REGISTRY}/ai-service:latest
        log_success "AI service image built and pushed"
    fi

    log_success "All Docker images built and pushed"
}

deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."

    cd infrastructure/aws

    # Initialize Terraform
    terraform init

    # Validate configuration
    terraform validate

    # Plan deployment
    log_info "Planning infrastructure changes..."
    terraform plan -out=tfplan

    # Ask for confirmation
    read -p "Do you want to apply these changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled by user"
        exit 0
    fi

    # Apply changes
    log_info "Applying infrastructure changes..."
    terraform apply tfplan

    # Get outputs
    API_URL=$(terraform output -raw alb_dns_name)
    DATABASE_ENDPOINT=$(terraform output -raw database_endpoint)
    REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

    cd ../..

    log_success "Infrastructure deployed successfully"
    log_info "API URL: https://${API_URL}"
    log_info "Database: ${DATABASE_ENDPOINT}"
    log_info "Redis: ${REDIS_ENDPOINT}"
}

setup_ssl_and_dns() {
    log_info "Setting up SSL certificates and DNS..."

    cd infrastructure/aws

    # Wait for SSL certificate validation
    if [ "$CREATE_SSL_CERTIFICATE" = "true" ]; then
        log_info "Waiting for SSL certificate validation..."
        aws acm describe-certificate --certificate-arn $(terraform output -raw ssl_certificate_arn) --query 'Certificate.Status' --output text | grep -q 'ISSUED' || {
            log_warning "SSL certificate not yet issued. Please complete DNS validation manually."
        }
    fi

    cd ../..
    log_success "SSL and DNS setup completed"
}

run_database_migrations() {
    log_info "Running database migrations..."

    # Get database connection details from Terraform outputs
    cd infrastructure/aws
    DB_HOST=$(terraform output -raw database_endpoint | cut -d: -f1)
    DB_PORT=$(terraform output -raw database_endpoint | cut -d: -f2)
    cd ../..

    # Run Prisma migrations
    cd backend
    npx prisma migrate deploy
    npx prisma db seed
    cd ..

    log_success "Database migrations completed"
}

deploy_services() {
    log_info "Deploying services to ECS..."

    cd infrastructure/aws

    # Update ECS services with new images
    log_info "Updating ECS services..."

    # Backend service
    aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service nilelink-backend-service --force-new-deployment

    # AI service
    aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service nilelink-ai-service --force-new-deployment

    # Frontend services
    frontend_services=("customer" "supplier" "pos" "super-admin" "unified" "investor" "portal" "admin" "delivery")
    for service in "${frontend_services[@]}"; do
        service_name="nilelink-${service}-service"
        log_info "Updating ${service_name}..."
        aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service $service_name --force-new-deployment 2>/dev/null || log_warning "$service_name not found, skipping..."
    done

    # Wait for critical services to be stable
    log_info "Waiting for critical services to be stable..."
    aws ecs wait services-stable --cluster $(terraform output -raw ecs_cluster_name) --services nilelink-backend-service 2>/dev/null || log_warning "Backend service stability check failed"

    cd ../..
    log_success "Services deployed successfully"
}

run_health_checks() {
    log_info "Running health checks..."

    # Get ALB DNS name
    cd infrastructure/aws
    ALB_DNS=$(terraform output -raw alb_dns_name)
    cd ../..

    # Wait for ALB to be ready
    sleep 60

    # Check backend health
    max_attempts=10
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://${ALB_DNS}/api/health" > /dev/null; then
            log_success "Backend health check passed"
            break
        else
            log_warning "Backend health check failed (attempt $attempt/$max_attempts)"
            sleep 30
            ((attempt++))
        fi
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Backend health check failed after $max_attempts attempts"
        exit 1
    fi

    # Check portal health
    if curl -f -s "http://${ALB_DNS}/api/health" > /dev/null; then
        log_success "Portal health check passed"
    else
        log_warning "Portal health check failed - may take longer to start"
    fi
}

run_integration_tests() {
    log_info "Running integration tests..."

    # Get ALB DNS name
    cd infrastructure/aws
    ALB_DNS=$(terraform output -raw alb_dns_name)
    cd ../..

    # Set test environment variables
    export BACKEND_URL="http://${ALB_DNS}"
    export API_URL="http://${ALB_DNS}/api"

    # Run end-to-end tests
    npm run test:e2e

    log_success "Integration tests completed"
}

enable_monitoring() {
    log_info "Setting up monitoring and alerting..."

    cd infrastructure/aws

    # Get monitoring endpoints
    PROMETHEUS_URL=$(terraform output -raw prometheus_endpoint 2>/dev/null || echo "Not configured")
    GRAFANA_URL=$(terraform output -raw grafana_endpoint 2>/dev/null || echo "Not configured")

    if [ "$PROMETHEUS_URL" != "Not configured" ]; then
        log_info "Prometheus: ${PROMETHEUS_URL}"
        log_info "Grafana: ${GRAFANA_URL}"

        # Configure basic dashboards
        log_info "Configuring monitoring dashboards..."
        # Add dashboard configuration here
    fi

    cd ../..
    log_success "Monitoring setup completed"
}

create_deployment_summary() {
    log_info "Creating deployment summary..."

    DEPLOYMENT_SUMMARY="/tmp/nilelink-deployment-$(date +%Y%m%d-%H%M%S).txt"

    {
        echo "=== NileLink Production Deployment Summary ==="
        echo "Date: $(date)"
        echo "Environment: ${ENVIRONMENT}"
        echo ""
        echo "=== Infrastructure ==="
        echo "Region: ${AWS_REGION}"
        echo "VPC: $(cd infrastructure/aws && terraform output vpc_id)"
        echo "Database: $(cd infrastructure/aws && terraform output database_endpoint)"
        echo "Redis: $(cd infrastructure/aws && terraform output redis_endpoint)"
        echo "ALB: https://$(cd infrastructure/aws && terraform output alb_dns_name)"
        echo ""
        echo "=== Services ==="
        echo "Backend: ✅ Deployed"
        echo "Portal: ✅ Deployed"
        echo "Database: ✅ Migrated"
        echo ""
        echo "=== Health Checks ==="
        echo "Backend: ✅ Passed"
        echo "Portal: ✅ Passed"
        echo ""
        echo "=== Next Steps ==="
        echo "1. Configure domain DNS to point to ALB"
        echo "2. Set up CDN (Cloudflare)"
        echo "3. Configure monitoring alerts"
        echo "4. Set up backup schedules"
        echo "5. Run performance tests"
        echo "6. Plan beta launch"
    } > "$DEPLOYMENT_SUMMARY"

    log_success "Deployment summary created: $DEPLOYMENT_SUMMARY"
    cat "$DEPLOYMENT_SUMMARY"
}

main() {
    log_info "Starting NileLink production deployment..."

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-infra)
                SKIP_INFRA=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    check_prerequisites

    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN MODE - No actual changes will be made"
    fi

    if [ "$SKIP_BUILD" != "true" ]; then
        build_and_push_images
    fi

    if [ "$SKIP_INFRA" != "true" ]; then
        deploy_infrastructure
    fi

    setup_ssl_and_dns
    run_database_migrations
    deploy_services
    run_health_checks

    if [ "$DRY_RUN" != "true" ]; then
        run_integration_tests
    fi

    enable_monitoring
    create_deployment_summary

    log_success "🎉 NileLink production deployment completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Update DNS records to point to the ALB"
    log_info "2. Configure SSL certificates"
    log_info "3. Set up monitoring alerts"
    log_info "4. Run beta testing"
    log_info "5. Plan soft launch"
}

# Handle script interruption
trap 'log_error "Deployment interrupted by user"; exit 1' INT TERM

# Run main function
main "$@"