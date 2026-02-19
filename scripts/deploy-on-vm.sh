#!/bin/bash
# Run on Oracle VM via SSH - completes steps 6-8
set -e
cd /home/ubuntu/task-manager-fullstack

COMPOSE="docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml"

echo "=== Step 6: Check / Start containers ==="
$COMPOSE ps
CONTAINERS=$($COMPOSE ps -q 2>/dev/null || true)
if [ -z "$CONTAINERS" ]; then
  echo "Starting containers..."
  $COMPOSE up -d
  echo "Waiting 25s for services..."
  sleep 25
else
  echo "Containers running"
fi

echo ""
echo "=== Step 7: Init DB and JWT ==="
$COMPOSE exec -T backend php bin/console doctrine:database:create --if-not-exists 2>/dev/null || true
$COMPOSE exec -T backend php bin/console doctrine:schema:update --force
$COMPOSE exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists 2>/dev/null || \
  $COMPOSE exec -T backend php bin/console lexik:jwt:generate-keypair

echo ""
echo "=== Step 8: Verify ==="
curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost:8000/api || echo "API: check failed"
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:4200 || echo "Frontend: check failed"

echo ""
echo "=== Done ==="
echo "Frontend:  http://152.70.53.27:4200"
echo "Backend:   http://152.70.53.27:8000/api"
echo "HF Space:  https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard"
