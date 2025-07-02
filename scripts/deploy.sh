#!/bin/bash

# AniX Deployment Script
# This script deploys the AniX application using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
SKIP_SSL=false
FORCE_REBUILD=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --domain DOMAIN    Your domain name (required for SSL)"
    echo "  -e, --email EMAIL      Email for Let's Encrypt (required for SSL)"
    echo "  --skip-ssl             Skip SSL setup"
    echo "  --force-rebuild        Force rebuild of Docker images"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --domain anix.example.com --email admin@example.com"
    echo "  $0 --skip-ssl"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        --force-rebuild)
            FORCE_REBUILD=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if we're in the right directory
if [[ ! -f "docker-compose.yml" ]]; then
    print_error "docker-compose.yml not found. Please run this script from the AniX repository root."
    exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine Docker Compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

print_status "Starting AniX deployment..."

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p ssl logs

# Stop existing containers
print_status "Stopping existing containers..."
$DOCKER_COMPOSE down || true

# Build/rebuild images if requested
if [[ "$FORCE_REBUILD" == true ]]; then
    print_status "Force rebuilding Docker images..."
    $DOCKER_COMPOSE build --no-cache
else
    print_status "Building Docker images..."
    $DOCKER_COMPOSE build
fi

# Setup SSL if domain and email are provided
if [[ -n "$DOMAIN" && -n "$EMAIL" && "$SKIP_SSL" == false ]]; then
    print_status "Setting up SSL for domain: $DOMAIN"
    
    if [[ -f "scripts/ssl-setup.sh" ]]; then
        chmod +x scripts/ssl-setup.sh
        ./scripts/ssl-setup.sh --domain "$DOMAIN" --email "$EMAIL"
    else
        print_warning "SSL setup script not found. SSL certificates need to be obtained manually."
    fi
elif [[ "$SKIP_SSL" == false ]]; then
    print_warning "Domain and/or email not provided. Skipping SSL setup."
    print_warning "The application will start without HTTPS. Use --domain and --email for SSL."
fi

# Update nginx configuration with domain if provided
if [[ -n "$DOMAIN" ]]; then
    print_status "Updating nginx configuration for domain: $DOMAIN"
    sed -i.bak "s/server_name _;/server_name $DOMAIN;/g" nginx/sites-enabled/anix.conf
fi

# Start the application
print_status "Starting AniX application..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    print_success "AniX has been deployed successfully!"
    
    if [[ -n "$DOMAIN" ]]; then
        if [[ "$SKIP_SSL" == true ]]; then
            print_success "Application is available at: http://$DOMAIN"
        else
            print_success "Application is available at: https://$DOMAIN"
        fi
    else
        print_success "Application is available at: http://localhost"
    fi
    
    print_status "To view logs: $DOCKER_COMPOSE logs -f"
    print_status "To stop: $DOCKER_COMPOSE down"
else
    print_error "Some services failed to start. Check logs with: $DOCKER_COMPOSE logs"
    exit 1
fi