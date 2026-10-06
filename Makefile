.PHONY: help dev prod build-dev build-prod up down logs clean restart test test-data test-watch lint

CONTAINER_ENGINE ?= podman
DEV_IMAGE ?= daggerheart-designer-dev
PROD_IMAGE ?= daggerheart-designer
DEV_CONTAINER ?= daggerheart-designer-dev
PROD_CONTAINER ?= daggerheart-designer-prod

help:
	@echo "Available commands:"
	@echo "  make dev          - Build and start the development server (port 5173)"
	@echo "  make prod         - Build and start the production server (port 8080)"
	@echo "  make test         - Run JavaScript tests in a container"
	@echo "  make test-data    - Run SRD extractor/data regression tests"
	@echo "  make test-watch   - Run tests in watch mode in a container"
	@echo "  make lint         - Run ESLint in a container"
	@echo "  make build-dev    - Build the development image"
	@echo "  make build-prod   - Build the production image"
	@echo "  make down         - Stop and remove app containers"
	@echo "  make logs         - Follow development container logs"
	@echo "  make restart      - Restart the development server"
	@echo "  make clean        - Stop containers and remove project images"

dev: build-dev
	$(CONTAINER_ENGINE) run --rm --name $(DEV_CONTAINER) --publish 5173:5173 \
		--volume "$(CURDIR):/app:Z" --volume /app/node_modules \
		--env NODE_ENV=development $(DEV_IMAGE)

prod: build-prod
	$(CONTAINER_ENGINE) run --rm --name $(PROD_CONTAINER) --publish 8080:80 $(PROD_IMAGE)

build-dev:
	$(CONTAINER_ENGINE) build --tag $(DEV_IMAGE) --file Dockerfile.dev .

build-prod:
	$(CONTAINER_ENGINE) build --tag $(PROD_IMAGE) --file Dockerfile .

up: dev

down:
	-$(CONTAINER_ENGINE) rm --force $(DEV_CONTAINER) $(PROD_CONTAINER)

logs:
	$(CONTAINER_ENGINE) logs --follow $(DEV_CONTAINER)

restart: down dev

clean: down
	-$(CONTAINER_ENGINE) rmi $(DEV_IMAGE) $(PROD_IMAGE)

test: build-dev
	$(CONTAINER_ENGINE) run --rm --env NODE_ENV=test $(DEV_IMAGE) test

test-data:
	python3 -m unittest discover scripts -p 'test_*.py'

test-watch: build-dev
	$(CONTAINER_ENGINE) run --rm --interactive --tty --env NODE_ENV=test $(DEV_IMAGE) run test:watch

lint: build-dev
	$(CONTAINER_ENGINE) run --rm $(DEV_IMAGE) run lint
