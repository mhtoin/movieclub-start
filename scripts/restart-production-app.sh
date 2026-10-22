#!/usr/bin/env bash
# Rebuild and recreate the production app using the production environment file.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-$HOME/.config/movieclub/.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Production environment file not found: $ENV_FILE" >&2
  echo "Set MOVIECLUB_ENV_FILE to its location, if needed." >&2
  exit 1
fi

"${COMPOSE[@]}" config --quiet
"${COMPOSE[@]}" up -d --build --force-recreate app
