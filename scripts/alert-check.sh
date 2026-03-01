#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="${1:-/tmp/nexuschat-health-check.log}"
ERROR_THRESHOLD="${ERROR_THRESHOLD:-1}"

if [[ ! -f "$LOG_FILE" ]]; then
  echo "[alert] log file not found: $LOG_FILE"
  exit 1
fi

request_errors=$(grep -c '"message":"request_error"' "$LOG_FILE" || true)
server_errors=$(grep -c '"message":"server_error"' "$LOG_FILE" || true)
total_errors=$((request_errors + server_errors))

echo "[alert] request_error=${request_errors} server_error=${server_errors} total=${total_errors}"

if (( total_errors >= ERROR_THRESHOLD )); then
  echo "[alert] threshold reached: ${total_errors} >= ${ERROR_THRESHOLD}"
  exit 2
fi

echo "[alert] status=ok"
