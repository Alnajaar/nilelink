#!/bin/bash

# NileLink Production Environment Setup Script
# This script helps set up production environment variables securely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if required tools are available
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install it first."
        exit 1
    fi

    log_success "Dependencies check passed"
}

# Generate secure random strings
generate_secret() {
    openssl rand -hex 32
}

# Setup AWS Secrets Manager secrets
setup_aws_secrets() {
    log_info "Setting up AWS Secrets Manager secrets..."

    # Database credentials
    DB_PASSWORD=$(generate_secret)
    JWT_SECRET=$(generate_secret)
    MAGIC_SECRET=$(generate_secret)
    EVENT_ENCRYPTION_KEY=$(generate_secret)
    INTEGRITY_KEY=$(generate_secret)
    DATA_ENCRYPTION_KEY=$(generate_secret)
    BACKUP_ENCRYPTION_KEY=$(generate_secret)

    # Create secrets in AWS Secrets Manager
    aws secretsmanager create-secret \
        --name "nilelink/prod/database" \
        --description "NileLink production database credentials" \
        --secret-string "{\"username\":\"nilelink_prod\",\"password\":\"${DB_PASSWORD}\"}"

    aws secretsmanager create-secret \
        --name "nilelink/prod/jwt" \
        --description "NileLink production JWT configuration" \
        --secret-string "{\"secret\":\"${JWT_SECRET}\"}"

    aws secretsmanager create-secret \
        --name "nilelink/prod/magic" \
        --description "NileLink production Magic authentication" \
        --secret-string "{\"secret\":\"${MAGIC_SECRET}\"}"

    aws secretsmanager create-secret \
        --name "nilelink/prod/encryption" \
        --description "NileLink production encryption keys" \
        --secret-string "{\"event_key\":\"${EVENT_ENCRYPTION_KEY}\",\"integrity_key\":\"${INTEGRITY_KEY}\",\"data_key\":\"${DATA_ENCRYPTION_KEY}\",\"backup_key\":\"${BACKUP_ENCRYPTION_KEY}\"}"

    log_success "AWS Secrets Manager secrets created"
}

# Generate production environment file
generate_env_file() {
    log_info "Generating production environment file..."

    cat > .env.production.local << EOF
# ========================================
# Generated Production Environment Variables
# DO NOT COMMIT THIS FILE TO VERSION CONTROL
# ========================================

# Database (will be populated by AWS Secrets Manager)
POSTGRES_USER=nilelink_prod
POSTGRES_DB=nilelink_prod
DATABASE_URL=\${DATABASE_URL}

# Security (will be populated by AWS Secrets Manager)
JWT_SECRET=\${JWT_SECRET}
MAGIC_SECRET_KEY=\${MAGIC_SECRET_KEY}
EVENT_ENCRYPTION_KEY=\${EVENT_ENCRYPTION_KEY}
INTEGRITY_KEY=\${INTEGRITY_KEY}
DATA_ENCRYPTION_KEY=\${DATA_ENCRYPTION_KEY}
BACKUP_ENCRYPTION_KEY=\${BACKUP_ENCRYPTION_KEY}

# Application
NODE_ENV=production
DOMAIN=nilelink.app
API_URL=https://api.nilelink.app
FRONTEND_URL=https://nilelink.app

# Redis
REDIS_URL=\${REDIS_URL}

# Payment Gateway
STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET}

# Email
SMTP_HOST=\${SMTP_HOST}
SMTP_PORT=\${SMTP_PORT}
SMTP_USER=\${SMTP_USER}
SMTP_PASS=\${SMTP_PASS}
FROM_EMAIL=noreply@nilelink.app

# Blockchain
POLYGON_RPC_URL=\${POLYGON_RPC_URL}
INFURA_PROJECT_ID=\${INFURA_PROJECT_ID}

# AI Service
OPENAI_API_KEY=\${OPENAI_API_KEY}
INTERNAL_API_KEY=\${INTERNAL_API_KEY}

# Monitoring
GRAFANA_ADMIN_PASSWORD=\${GRAFANA_PASSWORD}
SLACK_WEBHOOK_URL=\${SLACK_WEBHOOK_URL}
DISCORD_WEBHOOK_URL=\${DISCORD_WEBHOOK_URL}

# Feature Flags
ENABLE_BLOCKCHAIN=true
ENABLE_AI_INSIGHTS=true
ENABLE_MULTIPLE_PAYMENT_METHODS=true
ENABLE_OFFLINE_MODE=true
ENABLE_REAL_TIME_UPDATES=true
EOF

    log_success "Production environment file generated: .env.production.local"
    log_warning "Remember to populate the \${VARIABLES} with actual values from AWS Secrets Manager"
}

# Validate AWS access
validate_aws_access() {
    log_info "Validating AWS access..."

    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured or invalid"
        log_info "Run 'aws configure' to set up your AWS credentials"
        exit 1
    fi

    # Check if required permissions are available
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)

    log_success "AWS access validated - Account: ${ACCOUNT_ID}, Region: ${REGION}"
}

# Main setup function
main() {
    log_info "🚀 Setting up NileLink production environment..."

    check_dependencies
    validate_aws_access

    echo
    log_warning "This script will:"
    echo "  1. Create AWS Secrets Manager secrets with randomly generated values"
    echo "  2. Generate a production environment template file"
    echo "  3. Guide you through manual configuration steps"
    echo

    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled"
        exit 0
    fi

    setup_aws_secrets
    generate_env_file

    echo
    log_success "🎉 Production environment setup completed!"
    echo
    log_info "Next steps:"
    echo "1. Update .env.production.local with actual service credentials"
    echo "2. Configure third-party services (Stripe, SMTP, etc.)"
    echo "3. Run infrastructure deployment: ./scripts/deploy-production.sh"
    echo "4. Set up DNS records for your domains"
    echo "5. Configure SSL certificates"
    echo

    log_warning "IMPORTANT SECURITY REMINDER:"
    echo "- Never commit .env.production.local to version control"
    echo "- Rotate secrets regularly"
    echo "- Use AWS Secrets Manager for all sensitive data"
    echo "- Enable CloudTrail for audit logging"
}

# Run main function
main "$@"