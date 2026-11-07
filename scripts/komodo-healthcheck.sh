#!/usr/bin/env bash
# scripts/komodo-healthcheck.sh
#
# Poll the public MovieClub health endpoint and notify Komodo only when the
# state changes (UP -> DOWN sends CRITICAL, DOWN -> UP sends OK).
#
# Intended to be run every 60 seconds by a macOS LaunchAgent installed with
# scripts/install-komodo-healthcheck-launchd.sh.
#
# Credentials are read from an external, user-protected file (default
# ~/.config/movieclub/komodo-health.env). They are never echoed or committed.
#
# Exit codes:
#   0  health is UP (or initial UP recorded without an alert)
#   1  health is DOWN (CRITICAL alert delivered)
#   2  configuration / local setup error
#   3  a transition was detected but the Komodo alert could not be sent
set -euo pipefail

SCRIPT_NAME="${0##*/}"
ENV_FILE="${KOMODO_HEALTH_ENV_FILE:-$HOME/.config/movieclub/komodo-health.env}"

timestamp() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

log() {
  printf '%s [%s] %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*"
}

err() {
  printf '%s [%s] ERROR: %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*" >&2
}

fail() {
  err "$1"
  exit "${2:-2}"
}

# ---------------------------------------------------------------------------
# Load and validate credentials
# ---------------------------------------------------------------------------
if [[ ! -f "$ENV_FILE" ]]; then
  fail "credential file not found: $ENV_FILE (see docs/monitoring.md)" 2
fi

case "$(uname -s)" in
  Darwin) env_mode="$(stat -f '%Lp' "$ENV_FILE")" ;;
  *)      env_mode="$(stat -c '%a' "$ENV_FILE")" ;;
esac
if [[ "${env_mode: -2}" != "00" ]]; then
  fail "credential file $ENV_FILE is accessible by group/other (mode $env_mode); run: chmod 600 \"$ENV_FILE\"" 2
fi

# The credential file is a shell-compatible KEY=VALUE file. Do not export the
# values: they are only needed by this shell and should not leak into child
# process environments.
# shellcheck disable=SC1090
. "$ENV_FILE"

[[ -n "${KOMODO_URL:-}" ]]          || fail "KOMODO_URL is not set in $ENV_FILE" 2
[[ -n "${KOMODO_API_KEY:-}" ]]      || fail "KOMODO_API_KEY is not set in $ENV_FILE" 2
[[ -n "${KOMODO_API_SECRET:-}" ]]   || fail "KOMODO_API_SECRET is not set in $ENV_FILE" 2
[[ -n "${KOMODO_ALERTER_NAME:-}" ]] || fail "KOMODO_ALERTER_NAME is not set in $ENV_FILE" 2

HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://leffaseura.club/api/health}"
STATE_FILE="${KOMODO_HEALTH_STATE_FILE:-$HOME/.local/state/movieclub/komodo-health.state}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-2}"
HEALTHCHECK_RETRY_DELAY="${HEALTHCHECK_RETRY_DELAY:-3}"
KOMODO_HEALTH_TIMEOUT="${KOMODO_HEALTH_TIMEOUT:-10}"
KOMODO_ALERT_TIMEOUT="${KOMODO_ALERT_TIMEOUT:-15}"

while [[ "$KOMODO_URL" == */ ]]; do
  KOMODO_URL="${KOMODO_URL%/}"
done

case "$KOMODO_URL" in
  http://*|https://*) ;;
  *) fail "KOMODO_URL must start with http:// or https://" 2 ;;
esac

case "$HEALTHCHECK_URL" in
  http://*|https://*) ;;
  *) fail "HEALTHCHECK_URL must start with http:// or https://" 2 ;;
esac
case "$HEALTHCHECK_URL" in
  *\?*|*\#*|*@*) fail "HEALTHCHECK_URL must not contain a query, fragment, or user info" 2 ;;
esac
case "$KOMODO_URL" in
  *\?*|*\#*|*@*) fail "KOMODO_URL must not contain a query, fragment, or user info" 2 ;;
esac

case "$HEALTHCHECK_RETRIES" in
  ''|*[!0-9]*) fail "HEALTHCHECK_RETRIES must be a positive integer" 2 ;;
esac
if (( HEALTHCHECK_RETRIES < 1 )); then
  fail "HEALTHCHECK_RETRIES must be at least 1" 2
fi

command -v curl >/dev/null 2>&1 || fail "curl is required" 2

HOSTNAME_SHORT="$(hostname -s 2>/dev/null || hostname)"
LAST_HEALTH_HTTP_CODE=""
LAST_HEALTH_ERROR=""

# ---------------------------------------------------------------------------
# JSON helpers (jq preferred, python3 fallback)
# ---------------------------------------------------------------------------
json_encode_alert() {
  local level="$1" message="$2" details="$3"

  if command -v jq >/dev/null 2>&1; then
    jq -cn \
      --arg level "$level" \
      --arg message "$message" \
      --arg details "$details" \
      --arg alerter "$KOMODO_ALERTER_NAME" \
      '{level: $level, message: $message, details: $details, alerters: [$alerter]}'
  elif command -v python3 >/dev/null 2>&1; then
    LEVEL="$level" MESSAGE="$message" DETAILS="$details" ALERTER="$KOMODO_ALERTER_NAME" \
      python3 -c 'import json, os; print(json.dumps({"level": os.environ["LEVEL"], "message": os.environ["MESSAGE"], "details": os.environ["DETAILS"], "alerters": [os.environ["ALERTER"]]}))'
  else
    return 1
  fi
}

response_is_success() {
  local response="$1"

  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$response" | jq -e '.success == true' >/dev/null 2>&1
  elif command -v python3 >/dev/null 2>&1; then
    printf '%s' "$response" | python3 -c 'import json, sys; sys.exit(0 if json.load(sys.stdin).get("success") is True else 1)' >/dev/null 2>&1
  else
    return 1
  fi
}

truncate_response() {
  printf '%s' "$1" | tr '\n' ' ' | cut -c1-500
}

# ---------------------------------------------------------------------------
# Komodo SendAlert
# ---------------------------------------------------------------------------
send_alert() {
  local level="$1" message="$2" details="$3"
  local payload response_file header_file http_code response

  if ! payload="$(json_encode_alert "$level" "$message" "$details")"; then
    err "cannot encode JSON payload; install jq or python3"
    return 1
  fi

  response_file="$(mktemp -t movieclub-health-response)"
  header_file="$(mktemp -t movieclub-komodo-headers)"
  chmod 600 "$header_file"
  printf 'X-Api-Key: %s\nX-Api-Secret: %s\n' \
    "$KOMODO_API_KEY" "$KOMODO_API_SECRET" > "$header_file"

  # Headers come from a 0600 file so the credentials never appear in `ps`.
  if ! http_code="$(
    curl --silent --show-error --max-time "$KOMODO_ALERT_TIMEOUT" \
      --output "$response_file" --write-out '%{http_code}' \
      --request POST "$KOMODO_URL/execute/SendAlert" \
      --header 'Content-Type: application/json' \
      --header "@$header_file" \
      --data-binary "$payload"
  )"; then
    rm -f "$response_file" "$header_file"
    err "Komodo alert request failed (curl/network error)"
    return 1
  fi

  rm -f "$header_file"
  response="$(cat "$response_file")"
  rm -f "$response_file"

  if [[ "$http_code" != 2* ]]; then
    err "Komodo rejected the $level alert (HTTP $http_code): $(truncate_response "$response")"
    return 1
  fi

  if ! response_is_success "$response"; then
    err "Komodo accepted the request but the alert did not succeed: $(truncate_response "$response")"
    return 1
  fi

  log "Komodo $level alert sent to '$KOMODO_ALERTER_NAME'."
  return 0
}

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
check_health() {
  local attempt=1 body_file

  body_file="$(mktemp -t movieclub-health-check)"

  while (( attempt <= HEALTHCHECK_RETRIES )); do
    if LAST_HEALTH_HTTP_CODE="$(
      curl --silent --show-error --max-time "$KOMODO_HEALTH_TIMEOUT" \
        --output "$body_file" --write-out '%{http_code}' \
        "$HEALTHCHECK_URL"
    )"; then
      if [[ "$LAST_HEALTH_HTTP_CODE" == 2* ]]; then
        rm -f "$body_file"
        LAST_HEALTH_ERROR=""
        return 0
      fi
      LAST_HEALTH_ERROR="endpoint returned HTTP $LAST_HEALTH_HTTP_CODE"
    else
      LAST_HEALTH_HTTP_CODE=""
      LAST_HEALTH_ERROR="could not reach $HEALTHCHECK_URL"
    fi

    attempt=$((attempt + 1))
    if (( attempt <= HEALTHCHECK_RETRIES )); then
      sleep "$HEALTHCHECK_RETRY_DELAY"
    fi
  done

  rm -f "$body_file"
  return 1
}

# ---------------------------------------------------------------------------
# State handling
# ---------------------------------------------------------------------------
STATE_DIR="$(dirname "$STATE_FILE")"
LOCK_DIR="${STATE_FILE}.lock"
mkdir -p "$STATE_DIR"

acquire_lock() {
  local now lock_mtime

  if mkdir "$LOCK_DIR" 2>/dev/null; then
    trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
    return 0
  fi

  now="$(date +%s)"
  lock_mtime="$(stat -f '%m' "$LOCK_DIR" 2>/dev/null || stat -c '%Y' "$LOCK_DIR" 2>/dev/null || printf '0')"
  if [[ "$lock_mtime" =~ ^[0-9]+$ ]] && (( now - lock_mtime > 300 )); then
    err "removing stale lock $LOCK_DIR (older than 5 minutes)"
    rmdir "$LOCK_DIR" 2>/dev/null || true
    if mkdir "$LOCK_DIR" 2>/dev/null; then
      trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
      return 0
    fi
  fi

  return 1
}

read_state() {
  if [[ -f "$STATE_FILE" ]]; then
    tr -d '[:space:]' < "$STATE_FILE"
  fi
}

write_state() {
  local new_state="$1" tmp
  tmp="$STATE_FILE.tmp.$$"
  printf '%s\n' "$new_state" > "$tmp"
  mv "$tmp" "$STATE_FILE"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
acquire_lock || {
  log "previous run is still active; skipping this interval"
  exit 0
}

if check_health; then
  health_state="up"
else
  health_state="down"
fi

previous_state="$(read_state)"
case "$previous_state" in
  up|down|"") ;;
  *)
    err "ignoring invalid state file content '$previous_state'"
    previous_state=""
    ;;
esac

now="$(timestamp)"

if [[ "$health_state" == "$previous_state" ]]; then
  if [[ "$health_state" == "up" ]]; then
    exit 0
  fi
  exit 1
fi

if [[ "$health_state" == "up" ]]; then
  if [[ -z "$previous_state" ]]; then
    write_state "up"
    log "initial health state is UP; recorded without sending a recovery alert"
    exit 0
  fi

  if send_alert \
    "OK" \
    "MovieClub is back UP: $HEALTHCHECK_URL" \
    "Recovered at: $now
Previous state: $previous_state
URL: $HEALTHCHECK_URL
HTTP status: ${LAST_HEALTH_HTTP_CODE:-unknown}
Host: $HOSTNAME_SHORT"; then
    write_state "up"
    log "transition recorded: $previous_state -> up"
    exit 0
  fi

  err "could not send recovery alert; state remains '$previous_state' and will retry next run"
  exit 3
fi

if send_alert \
  "CRITICAL" \
  "MovieClub is DOWN: $HEALTHCHECK_URL" \
  "Detected at: $now
Previous state: ${previous_state:-<none>}
URL: $HEALTHCHECK_URL
HTTP status: ${LAST_HEALTH_HTTP_CODE:-unavailable}
Error: ${LAST_HEALTH_ERROR:-none}
Host: $HOSTNAME_SHORT"; then
  write_state "down"
  log "transition recorded: ${previous_state:-<initial>} -> down"
  exit 1
fi

err "could not send CRITICAL alert; state remains '${previous_state:-<none>}' and will retry next run"
exit 3
