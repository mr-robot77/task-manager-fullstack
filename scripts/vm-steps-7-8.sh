#!/bin/bash
# Run ONLY steps 7 & 8 - assumes containers are already running
# Usage: ssh ubuntu@VM bash -s < scripts/vm-steps-7-8.sh
set -e
cd /home/ubuntu/task-manager-fullstack

COMPOSE="docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml"

echo "=== Step 7: Init database and JWT ==="
$COMPOSE exec -T backend php bin/console doctrine:database:create --if-not-exists 2>/dev/null || true
$COMPOSE exec -T backend php bin/console doctrine:schema:update --force
$COMPOSE exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists 2>/dev/null || \
  $COMPOSE exec -T backend php bin/console lexik:jwt:generate-keypair

echo ""
echo "=== Step 8: Verify ==="
curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost:8000/api || true
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:4200 || true

echo ""
echo "Done. Frontend: http://152.70.53.27:4200 | API: http://152.70.53.27:8000/api"
