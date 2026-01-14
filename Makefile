.PHONY: help dev prod build-dev build-prod up down logs clean restart

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev          - Start development server with hot reload (port 5173)"
	@echo "  make prod         - Start production server with nginx (port 8080)"
	@echo "  make build-dev    - Build development Docker image"
	@echo "  make build-prod   - Build production Docker image"
	@echo "  make up           - Start development server (alias for dev)"
	@echo "  make down         - Stop and remove containers"
	@echo "  make logs         - Show container logs"
	@echo "  make restart      - Restart development server"
	@echo "  make clean        - Stop containers and remove images"

# Start development server
dev:
	sudo docker compose up dev

# Start production server
prod:
	sudo docker compose --profile production up prod

# Build development image
build-dev:
	sudo docker compose build dev

# Build production image
build-prod:
	sudo docker compose --profile production build prod

# Alias for dev
up: dev

# Stop containers
down:
	sudo docker compose down

# Show logs
logs:
	sudo docker compose logs -f

# Restart development server
restart:
	sudo docker compose restart dev

# Clean up containers and images
clean:
	sudo docker compose down
	sudo docker compose --profile production down
	sudo docker image prune -f
