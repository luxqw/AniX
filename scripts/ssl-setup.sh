#!/bin/bash

# AniX SSL Setup Script
# This script sets up SSL certificates using Let's Encrypt (Certbot)

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
STAGING=false
RENEW_ONLY=false

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
    echo "  -d, --domain DOMAIN    Your domain name (required)"
    echo "  -e, --email EMAIL      Email for Let's Encrypt (required)"
    echo "  --staging              Use Let's Encrypt staging environment (for testing)"
    echo "  --renew-only           Only renew existing certificates"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --domain anix.example.com --email admin@example.com"
    echo "  $0 --domain anix.example.com --email admin@example.com --staging"
    echo "  $0 --renew-only"
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
        --staging)
            STAGING=true
            shift
            ;;
        --renew-only)
            RENEW_ONLY=true
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

# Validate required parameters for new certificates
if [[ "$RENEW_ONLY" == false ]]; then
    if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
        print_error "Domain and email are required for SSL setup."
        show_usage
        exit 1
    fi
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    
    # Install certbot based on the system
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    elif command -v brew &> /dev/null; then
        brew install certbot
    else
        print_error "Could not install certbot. Please install it manually."
        print_error "Visit: https://certbot.eff.org/instructions"
        exit 1
    fi
fi

# Create ssl directory
mkdir -p ssl

if [[ "$RENEW_ONLY" == true ]]; then
    print_status "Renewing existing certificates..."
    
    if certbot renew --dry-run; then
        print_status "Certificate renewal dry-run successful. Performing actual renewal..."
        certbot renew
        
        # Copy renewed certificates
        if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
            sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/
            sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/
            sudo chown $(whoami):$(whoami) ssl/*.pem
            print_success "Certificates renewed and copied successfully!"
        else
            print_error "Could not find certificates to renew. Run without --renew-only first."
            exit 1
        fi
    else
        print_error "Certificate renewal failed."
        exit 1
    fi
    
    exit 0
fi

print_status "Setting up SSL certificates for domain: $DOMAIN"

# Build staging flag
STAGING_FLAG=""
if [[ "$STAGING" == true ]]; then
    STAGING_FLAG="--staging"
    print_warning "Using Let's Encrypt staging environment. Certificates will not be trusted by browsers."
fi

# Check if domain is accessible
print_status "Checking if domain $DOMAIN is accessible..."
if ! ping -c 1 "$DOMAIN" &> /dev/null; then
    print_warning "Domain $DOMAIN is not accessible from this server."
    print_warning "Make sure your domain's DNS A record points to this server's IP address."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop nginx if running to free port 80
if docker ps | grep -q "anix-nginx"; then
    print_status "Stopping nginx container to free port 80..."
    docker stop anix-nginx || true
fi

# Generate certificates using standalone mode
print_status "Requesting SSL certificate from Let's Encrypt..."
certbot certonly \
    --standalone \
    --agree-tos \
    --non-interactive \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    $STAGING_FLAG

# Check if certificates were generated
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" && -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]]; then
    print_status "Copying certificates to ssl directory..."
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/
    sudo chown $(whoami):$(whoami) ssl/*.pem
    
    print_success "SSL certificates have been successfully generated and copied!"
    print_status "Certificates location: ./ssl/"
    
    # Set up automatic renewal
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > ssl-renew.sh << 'EOF'
#!/bin/bash
# Auto-renewal script for Let's Encrypt certificates

# Stop nginx
docker stop anix-nginx 2>/dev/null || true

# Renew certificates
certbot renew --standalone

# Copy renewed certificates
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/
fi

# Start nginx
docker start anix-nginx 2>/dev/null || true
EOF
    
    chmod +x ssl-renew.sh
    
    print_status "Auto-renewal script created: ssl-renew.sh"
    print_status "To set up automatic renewal via cron, add this line to your crontab:"
    echo "0 2 * * 1 cd $(pwd) && ./ssl-renew.sh >> ssl-renew.log 2>&1"
    
else
    print_error "Failed to generate SSL certificates."
    print_error "Please check the output above for error details."
    exit 1
fi

print_success "SSL setup completed successfully!"
print_status "You can now start the application with SSL enabled."