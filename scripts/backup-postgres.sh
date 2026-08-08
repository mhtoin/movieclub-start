#!/usr/bin/env bash
# Create a compressed PostgreSQL backup outside the repository.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-$REPO_DIR/.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")
BACKUP_DIR="${1:-$HOME/movieclub-backups}"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
BACKUP_FILE="$BACKUP_DIR/movieclub-$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

cd "$REPO_DIR"
"${COMPOSE[@]}" exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$BACKUP_FILE"

# Keep 30 days of local backups. Copy important backups to another device too.
find "$BACKUP_DIR" -type f -name 'movieclub-*.sql.gz' -mtime +30 -delete

echo "Created $BACKUP_FILE"
