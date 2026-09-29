#!/usr/bin/env bash
# Replace the local Postgres database with a pg_dump from a remote Postgres
# (Railway or any other provider). Both ends must be on the same schema.
#
# Usage:
#   bash scripts/import-from-railway.sh '<remote-database-url>'
#
# Required env (defaults to .env.production in the repo):
#   MOVIECLUB_ENV_FILE   path to the env file with POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 '<remote-database-url>'" >&2
  echo "Example: $0 'postgresql://user:pass@containers-us-west-123.railway.app:5432/railway'" >&2
  exit 1
fi

REMOTE_URL="$1"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-$REPO_DIR/.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")
PG_CONTAINER="movieclub-postgres-prod"

# Load PG creds from the env file so we can build the local URL too.
set +u
POSTGRES_USER="$(grep '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2-)"
POSTGRES_PASSWORD="$(grep '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"
POSTGRES_DB="$(grep '^POSTGRES_DB=' "$ENV_FILE" | cut -d= -f2-)"
set -u

if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" ]]; then
  echo "Could not read POSTGRES_USER/PASSWORD/DB from $ENV_FILE" >&2
  exit 1
fi

cd "$REPO_DIR"

echo "==> Stopping the app container (keeps Postgres running)..."
"${COMPOSE[@]}" stop app

echo "==> Pulling postgres:17 client (matches Railway's server major version)..."
# The local Postgres container is 16-alpine, but Railway is running 17. pg_dump
# refuses to dump a server with a newer major version than itself. We use a
# one-shot postgres:17-alpine container whose pg_dump is happy to dump 17, and
# whose psql can talk to 16. Plain SQL is used because it's portable across
# major versions (no versioned binary format).
docker pull postgres:17-alpine >/dev/null

echo "==> Dumping remote database and restoring into local Postgres..."
# The one-shot container shares the local Postgres container's network
# namespace, so it can reach both Railway (default outbound) and the local
# server via localhost:5432. pg_dump writes plain SQL to stdout, piped
# directly to psql which wraps the whole restore in a single transaction.
# ON_ERROR_STOP=1 aborts on the first error so we don't end up with a
# half-restored DB.
docker run --rm \
  --network "container:$PG_CONTAINER" \
  -e REMOTE_URL="$REMOTE_URL" \
  -e LOCAL_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}" \
  postgres:17-alpine \
  sh -c '
    set -eu
    pg_dump \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists \
      --format=plain \
      --dbname="$REMOTE_URL" \
    | psql \
        --single-transaction \
        --dbname="$LOCAL_URL" \
        -v ON_ERROR_STOP=1
  '

echo "==> Starting the app container..."
"${COMPOSE[@]}" up -d app

echo "==> Waiting for the app health check..."
for attempt in {1..30}; do
  if "${COMPOSE[@]}" exec -T app node -e \
    "fetch('http://127.0.0.1:3001/api/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo "App did not become healthy in time." >&2
    "${COMPOSE[@]}" logs --tail=100 app
    exit 1
  fi
  sleep 2
done

echo ""
echo "Import complete. Local database now mirrors the remote dump."