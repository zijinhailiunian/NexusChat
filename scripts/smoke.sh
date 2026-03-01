#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3100}"
LOG_FILE="/tmp/nexuschat-smoke.log"

PORT="$PORT" node src/index.js >"$LOG_FILE" 2>&1 &
PID=$!

cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 1

HEALTH_RESPONSE="$(curl -fsS "http://127.0.0.1:${PORT}/health")"
ROOT_RESPONSE="$(curl -fsS "http://127.0.0.1:${PORT}/")"

echo "$HEALTH_RESPONSE" | grep -F '"status":"ok"' >/dev/null
echo "$ROOT_RESPONSE" | grep -F '"service":"NexusChat"' >/dev/null

echo "Smoke test passed on port ${PORT}."
