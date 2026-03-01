#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

printf "[1/3] Starting infrastructure...\n"
docker compose -f "$ROOT_DIR/infra/docker-compose.yml" up -d

printf "[2/3] Setting up API virtual environment...\n"
cd "$ROOT_DIR/apps/api"
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

printf "[3/3] Installing web dependencies...\n"
cd "$ROOT_DIR/apps/web"
npm install

printf "Bootstrap complete.\n"
