#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

git pull --rebase
npm install
npm run build

docker build -t bagua:latest .
docker rm -f bagua || true
docker run -d --name bagua -p 8080:80 --env-file .env bagua:latest
