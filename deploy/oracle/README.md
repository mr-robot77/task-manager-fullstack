# Oracle Always Free VM Deployment

This guide deploys the full stack (Angular + Symfony + MSSQL) on one Oracle VM using Docker Compose.

## 1) Prepare VM

Install Docker and Docker Compose plugin on Ubuntu VM:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and log back in once after `usermod`.

## 2) Clone and configure

```bash
git clone https://github.com/mr-robot77/task-manager-fullstack.git
cd task-manager-fullstack
cp deploy/oracle/.env.prod.example deploy/oracle/.env.prod
```

Edit `deploy/oracle/.env.prod` and set secure values.

## 3) Start stack

```bash
docker compose \
  --env-file deploy/oracle/.env.prod \
  -f deploy/oracle/docker-compose.prod.yml \
  up -d --build
```

## 4) Initialize database and JWT keys

```bash
docker compose \
  --env-file deploy/oracle/.env.prod \
  -f deploy/oracle/docker-compose.prod.yml \
  exec -T backend php bin/console doctrine:database:create --if-not-exists

docker compose \
  --env-file deploy/oracle/.env.prod \
  -f deploy/oracle/docker-compose.prod.yml \
  exec -T backend php bin/console doctrine:schema:update --force

docker compose \
  --env-file deploy/oracle/.env.prod \
  -f deploy/oracle/docker-compose.prod.yml \
  exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

## 5) Verify

- Frontend: `http://<VM_PUBLIC_IP>:4200`
- Backend API root: `http://<VM_PUBLIC_IP>:8000/api`

For better security and a custom domain, place Nginx/Caddy in front and expose only ports 80/443.
