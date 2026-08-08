#!/usr/bin/env bash
# Start the production Compose stack after Docker Desktop is available.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-$REPO_DIR/.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

cd "$REPO_DIR"

for attempt in {1..60}; do
  if docker info >/dev/null 2>&1; then
    "${COMPOSE[@]}" up -d --remove-orphans
    exit 0
  fi

  sleep 5
done

echo "Docker Desktop was not ready after five minutes." >&2
exit 1
