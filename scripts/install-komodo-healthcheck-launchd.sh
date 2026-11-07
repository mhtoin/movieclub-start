#!/usr/bin/env bash
# install-komodo-healthcheck-launchd.sh
#
# Install a macOS LaunchAgent that runs scripts/komodo-healthcheck.sh every
# 60 seconds (and once at login). Logs go to ~/Library/Logs/movieclub.
#
# Usage:
#   bash scripts/install-komodo-healthcheck-launchd.sh
#
# Override the credential file location with KOMODO_HEALTH_ENV_FILE.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LABEL="com.movieclub.healthcheck"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/movieclub"
ENV_FILE="${KOMODO_HEALTH_ENV_FILE:-$HOME/.config/movieclub/komodo-health.env}"
HEALTHCHECK_SCRIPT="$REPO_DIR/scripts/komodo-healthcheck.sh"

if [[ ! -f "$HEALTHCHECK_SCRIPT" ]]; then
  echo "Health check script not found: $HEALTHCHECK_SCRIPT" >&2
  exit 1
fi

if [[ ! -x "$HEALTHCHECK_SCRIPT" ]]; then
  echo "Health check script is not executable: $HEALTHCHECK_SCRIPT" >&2
  echo "Run: chmod +x \"$HEALTHCHECK_SCRIPT\"" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Credential file not found: $ENV_FILE" >&2
  echo "Create it with KOMODO_URL, KOMODO_API_KEY, KOMODO_API_SECRET, and KOMODO_ALERTER_NAME." >&2
  echo "See docs/monitoring.md for the exact contents. Never commit this file." >&2
  exit 1
fi

case "$(uname -s)" in
  Darwin) env_mode="$(stat -f '%Lp' "$ENV_FILE")" ;;
  *)      env_mode="$(stat -c '%a' "$ENV_FILE")" ;;
esac
if [[ "${env_mode: -2}" != "00" ]]; then
  echo "Credential file $ENV_FILE must not be accessible by group/other (mode $env_mode)." >&2
  echo "Run: chmod 600 \"$ENV_FILE\"" >&2
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
fi

# Escape values for XML text nodes. Ampersand must be replaced first.
xml_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'
}

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$(xml_escape "$HEALTHCHECK_SCRIPT")</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>KOMODO_HEALTH_ENV_FILE</key>
    <string>$(xml_escape "$ENV_FILE")</string>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>60</integer>
  <key>StandardOutPath</key>
  <string>$(xml_escape "$LOG_DIR/healthcheck.stdout.log")</string>
  <key>StandardErrorPath</key>
  <string>$(xml_escape "$LOG_DIR/healthcheck.stderr.log")</string>
</dict>
</plist>
EOF

if command -v plutil >/dev/null 2>&1; then
  if ! plutil -lint "$PLIST" >/dev/null; then
    echo "Generated plist failed validation: $PLIST" >&2
    exit 1
  fi
fi

launchctl bootstrap "gui/$(id -u)" "$PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true

echo "Installed $LABEL"
echo "  Schedule: every 60 seconds, plus at login"
echo "  Script:   $HEALTHCHECK_SCRIPT"
echo "  Config:   $ENV_FILE"
echo "  Logs:     $LOG_DIR/healthcheck.stdout.log"
echo "            $LOG_DIR/healthcheck.stderr.log"
