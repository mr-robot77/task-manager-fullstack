#!/bin/bash
# Run on Oracle VM after SSH: bash vm-build-and-start.sh
set -e
cd /home/ubuntu/task-manager-fullstack

# 1) Ensure .dockerignore reduces frontend context
cat > frontend/.dockerignore << 'EOF'
node_modules/
dist/
.angular/
coverage/
*.log
.git/
EOF

# 2) Build (no-cache to pick up .dockerignore)
echo "=== Building (this may take 10-15 min) ==="
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml build --no-cache

# 3) Start services
echo "=== Starting services ==="
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml up -d

# 4) Wait for backend to be ready
sleep 15

# 5) Init database and JWT
echo "=== Initializing database ==="
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console doctrine:database:create --if-not-exists || true
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console doctrine:schema:update --force
echo "=== Generating JWT keys ==="
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists 2>/dev/null || \
sudo docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console lexik:jwt:generate-keypair

echo ""
echo "=== Done ==="
echo "Frontend:  http://152.70.53.27:4200"
echo "Backend:   http://152.70.53.27:8000/api"
echo "HF Space:  https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard"
