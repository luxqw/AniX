# AniX Makefile
# Convenient commands for building, running, and managing the AniX application

.PHONY: help build dev prod down logs clean ssl-setup ssl-renew install lint test

# Default target
help: ## Show this help message
	@echo "AniX - Available Commands:"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make dev                    # Start development environment"
	@echo "  make prod DOMAIN=anix.com EMAIL=admin@anix.com  # Deploy with SSL"
	@echo "  make logs                   # View application logs"

# Development commands
install: ## Install dependencies
	npm install

dev: ## Start development environment
	@./scripts/dev.sh

dev-build: ## Start development environment with rebuild
	@./scripts/dev.sh --build

dev-logs: ## Start development environment and show logs
	@./scripts/dev.sh --logs

dev-down: ## Stop development environment
	@./scripts/dev.sh --down

# Production commands
prod: ## Deploy production environment (use DOMAIN= and EMAIL= for SSL)
ifdef DOMAIN
ifdef EMAIL
	@./scripts/deploy.sh --domain $(DOMAIN) --email $(EMAIL)
else
	@echo "Error: EMAIL is required when DOMAIN is specified"
	@echo "Usage: make prod DOMAIN=yourdomain.com EMAIL=your@email.com"
endif
else
	@./scripts/deploy.sh --skip-ssl
endif

prod-rebuild: ## Deploy with forced rebuild
ifdef DOMAIN
ifdef EMAIL
	@./scripts/deploy.sh --domain $(DOMAIN) --email $(EMAIL) --force-rebuild
else
	@./scripts/deploy.sh --skip-ssl --force-rebuild
endif
else
	@./scripts/deploy.sh --skip-ssl --force-rebuild
endif

# SSL commands
ssl-setup: ## Setup SSL certificates (requires DOMAIN= and EMAIL=)
ifndef DOMAIN
	@echo "Error: DOMAIN is required"
	@echo "Usage: make ssl-setup DOMAIN=yourdomain.com EMAIL=your@email.com"
else
ifndef EMAIL
	@echo "Error: EMAIL is required"
	@echo "Usage: make ssl-setup DOMAIN=yourdomain.com EMAIL=your@email.com"
else
	@./scripts/ssl-setup.sh --domain $(DOMAIN) --email $(EMAIL)
endif
endif

ssl-renew: ## Renew SSL certificates
	@./scripts/ssl-setup.sh --renew-only

# Docker commands
build: ## Build Docker images
	docker compose build

down: ## Stop all containers
	docker compose down
	docker compose -f docker-compose.dev.yml down

logs: ## View application logs
	@if docker compose ps | grep -q "Up"; then \
		docker compose logs -f; \
	elif docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then \
		docker compose -f docker-compose.dev.yml logs -f; \
	else \
		echo "No running containers found"; \
	fi

# Maintenance commands
clean: ## Clean up Docker resources
	docker compose down --rmi all --volumes --remove-orphans
	docker compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
	docker system prune -f

clean-all: ## Clean everything including unused Docker resources
	make clean
	docker system prune -af --volumes

# Application commands
lint: ## Run linter
	npm run lint

test: build ## Build and test the application
	@echo "Testing Docker build..."
	@docker-compose build
	@echo "Build successful!"

# Status commands
status: ## Show status of containers
	@echo "Production containers:"
	@docker compose ps 2>/dev/null || echo "No production containers running"
	@echo ""
	@echo "Development containers:"
	@docker compose -f docker-compose.dev.yml ps 2>/dev/null || echo "No development containers running"

# Backup commands
backup-ssl: ## Backup SSL certificates
	@if [ -d "ssl" ]; then \
		tar -czf ssl-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz ssl/; \
		echo "SSL certificates backed up"; \
	else \
		echo "No SSL certificates found"; \
	fi

# Quick aliases
start: dev ## Alias for dev
stop: down ## Alias for down
restart: down prod ## Restart production environment