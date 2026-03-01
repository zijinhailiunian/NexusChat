#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3200}"
LOG_FILE="/tmp/nexuschat-health-check.log"

PORT="$PORT" node src/index.js >"$LOG_FILE" 2>&1 &
PID=$!

cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 1

curl -fsS "http://127.0.0.1:${PORT}/health" | grep -F '"status":"ok"' >/dev/null

echo "Health check passed on port ${PORT}."
