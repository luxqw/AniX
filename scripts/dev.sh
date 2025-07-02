#!/bin/bash

# AniX Development Script
# This script starts the AniX application in development mode using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "  --build              Force rebuild of Docker images"
    echo "  --logs               Show logs after starting"
    echo "  --down               Stop development environment"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Example:"
    echo "  $0                   Start development environment"
    echo "  $0 --build           Start with rebuilding images"
    echo "  $0 --down            Stop development environment"
}

# Default options
BUILD=false
SHOW_LOGS=false
STOP_ENV=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --down)
            STOP_ENV=true
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
if [[ ! -f "docker-compose.dev.yml" ]]; then
    print_error "docker-compose.dev.yml not found. Please run this script from the AniX repository root."
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

if [[ "$STOP_ENV" == true ]]; then
    print_status "Stopping development environment..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml down
    print_success "Development environment stopped."
    exit 0
fi

print_status "Starting AniX development environment..."

# Stop existing containers
print_status "Stopping any existing containers..."
$DOCKER_COMPOSE -f docker-compose.dev.yml down || true

# Build images if requested
if [[ "$BUILD" == true ]]; then
    print_status "Building Docker images..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml build --no-cache
fi

# Create .env file if it doesn't exist
if [[ ! -f ".env" && -f ".env.sample" ]]; then
    print_status "Creating .env file from .env.sample..."
    cp .env.sample .env
    print_warning "Please edit .env file with your configuration."
fi

# Start the development environment
print_status "Starting development containers..."
$DOCKER_COMPOSE -f docker-compose.dev.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 5

# Check if services are running
if $DOCKER_COMPOSE -f docker-compose.dev.yml ps | grep -q "Up"; then
    print_success "AniX development environment started successfully!"
    print_success "Application is available at: http://localhost:3000"
    
    print_status "Useful commands:"
    echo "  View logs: $DOCKER_COMPOSE -f docker-compose.dev.yml logs -f"
    echo "  Stop: $DOCKER_COMPOSE -f docker-compose.dev.yml down"
    echo "  Rebuild: $0 --build"
    
    if [[ "$SHOW_LOGS" == true ]]; then
        print_status "Showing logs (Ctrl+C to exit):"
        $DOCKER_COMPOSE -f docker-compose.dev.yml logs -f
    fi
else
    print_error "Some services failed to start. Check logs with: $DOCKER_COMPOSE -f docker-compose.dev.yml logs"
    exit 1
fi