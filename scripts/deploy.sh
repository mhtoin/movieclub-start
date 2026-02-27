#!/usr/bin/env bash
# scripts/deploy.sh
#
# Manual deploy helper – mirrors what the GitHub Actions workflow does.
# Run this from the repo root on the home server:
#
#   bash scripts/deploy.sh
#
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Pulling latest base images (postgres, electric, etc.)..."
docker compose -f "$COMPOSE_FILE" pull --ignore-buildable

echo "==> Rebuilding app image (no cache)..."
docker compose -f "$COMPOSE_FILE" build --no-cache app

echo "==> Restarting containers..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "==> Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T app pnpm db:migrate

echo "==> Cleaning up dangling images..."
docker image prune -f

echo ""
echo "Deploy complete."
