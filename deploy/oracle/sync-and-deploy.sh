#!/bin/bash
# Sync Oracle VM with latest GitHub code and ensure demo data is loaded.
# Run this on the Oracle VM (SSH into 152.70.53.27).

set -e
cd "$(dirname "$0")/../.."
COMPOSE="docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml"

echo "=== Pulling latest from GitHub ==="
git pull origin main

echo "=== Rebuilding and restarting stack ==="
$COMPOSE up -d --build

echo "=== Waiting for backend to be healthy (up to 2 min) ==="
sleep 120

echo "=== Loading demo data (if not already present) ==="
$COMPOSE exec -T backend php bin/console app:load-demo-data --no-interaction || true

echo ""
echo "Done. Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VM_IP'):4200"
echo "Backend API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VM_IP'):8000/api"
