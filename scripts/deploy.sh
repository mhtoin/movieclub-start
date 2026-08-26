#!/usr/bin/env bash
# scripts/deploy.sh
#
# Manual deploy helper for the Mac mini or another Docker host.
# Run this from the repo root:
#
#   bash scripts/deploy.sh
#
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

if [[ "${1:-}" == "--skip-pull" ]]; then
  echo "==> Skipping git pull, image pull, and base-image pull (CI mode)..."
else
  echo "==> Pulling latest code..."
  git pull origin main

  echo "==> Pulling latest base images..."
  "${COMPOSE[@]}" pull --ignore-buildable
fi

echo "==> Validating Compose configuration..."
"${COMPOSE[@]}" config --quiet

echo "==> Rebuilding app image..."
if [[ "${1:-}" == "--skip-pull" ]]; then
  "${COMPOSE[@]}" build app
else
  "${COMPOSE[@]}" build --pull app
fi

echo "==> Restarting containers..."
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> Waiting for the app health check..."
for attempt in {1..30}; do
  if "${COMPOSE[@]}" exec -T app node -e \
    "fetch('http://127.0.0.1:3001/api/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi

  if [[ "$attempt" == 30 ]]; then
    "${COMPOSE[@]}" logs --tail=100 app
    exit 1
  fi

  sleep 2
done

echo "==> Running database migrations..."
"${COMPOSE[@]}" exec -T app pnpm db:migrate

echo "==> Cleaning up dangling images..."
docker image prune -f

echo ""
echo "Deploy complete."
