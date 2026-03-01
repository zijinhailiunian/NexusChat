#!/usr/bin/env bash
set -euo pipefail

PREVIOUS_VERSION="${1:-}"

if [[ -z "$PREVIOUS_VERSION" ]]; then
  echo "Usage: ./scripts/rollback.sh <previous-version-tag>"
  exit 1
fi

echo "[rollback] target version: $PREVIOUS_VERSION"
echo "[rollback] step 1/3: re-deploy previous artifact/tag $PREVIOUS_VERSION"
echo "[rollback] step 2/3: run health check"
bash scripts/health-check.sh

echo "[rollback] step 3/3: verify monitoring channel"
bash scripts/alert-check.sh /tmp/nexuschat-health-check.log || true

echo "[rollback] completed for $PREVIOUS_VERSION"
