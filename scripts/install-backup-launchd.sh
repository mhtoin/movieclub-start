#!/usr/bin/env bash
# Install a macOS LaunchAgent that runs the Postgres backup once a day at 03:00.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LABEL="com.movieclub.backup"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/movieclub"

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/$LABEL"
fi

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
    <string>$REPO_DIR/scripts/backup-postgres.sh</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>MOVIECLUB_ENV_FILE</key>
    <string>$HOME/.config/movieclub/.env.production</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>3</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/backup.stdout.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/backup.stderr.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed $LABEL (runs daily at 03:00, backups -> $HOME/movieclub-backups)"