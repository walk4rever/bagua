#!/usr/bin/env bash
#set -euo pipefail

#SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
#cd "$SCRIPT_DIR"

#git pull --rebase
npm install
npm run build

docker build -t bagua:latest .
docker rm -f bagua || true
# Changed port from 8080 to 8082 to free up 8080 for air7-fun homepage
docker run -d --name bagua -p 8082:80 --env-file .env bagua:latest
