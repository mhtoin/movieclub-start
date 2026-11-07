#!/usr/bin/env bash
# Start the production Compose stack after the selected Docker runtime is available.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="${MOVIECLUB_ENV_FILE:-$REPO_DIR/.env.production}"
DOCKER_CONTEXT="${DOCKER_CONTEXT:-colima}"
# LaunchAgents don't inherit the interactive shell's PATH. Docker Desktop
# commonly installs its CLI in /usr/local/bin; Homebrew may use /opt/homebrew/bin.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export DOCKER_CONTEXT
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

cd "$REPO_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker CLI not found in PATH: $PATH" >&2
  exit 1
fi

docker_ready() {
  docker info >/dev/null 2>&1 &
  local docker_pid=$!
  (
    sleep 5
    kill "$docker_pid" 2>/dev/null || true
  ) &
  local watchdog_pid=$!
  local status=0

  wait "$docker_pid" || status=$?
  kill "$watchdog_pid" 2>/dev/null || true
  wait "$watchdog_pid" 2>/dev/null || true
  return "$status"
}

if [[ "$DOCKER_CONTEXT" == "colima" ]]; then
  if ! command -v colima >/dev/null 2>&1; then
    echo "Colima is selected but not found in PATH: $PATH" >&2
    exit 1
  fi

  if ! colima status >/dev/null 2>&1; then
    echo "Colima is not running; starting it..."
    colima start --activate=false
  fi
elif ! docker_ready; then
  echo "Docker daemon is unavailable; starting Docker Desktop via its CLI..."
  if ! docker desktop start --detach; then
    echo "Could not start Docker Desktop. Check that it is installed and its first-run setup is complete." >&2
    exit 1
  fi
fi

for attempt in {1..30}; do
  if docker_ready; then
    "${COMPOSE[@]}" up -d --remove-orphans
    exit 0
  fi

  if [[ "$attempt" != 30 ]]; then
    sleep 5
  fi
done

echo "Docker daemon for context '$DOCKER_CONTEXT' was not ready after five minutes. Check the runtime logs and launch-agent stderr." >&2
exit 1
