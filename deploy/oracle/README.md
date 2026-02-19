# Oracle Always Free VM Deployment

This guide deploys the full stack (Angular + Symfony + Database) on one Oracle VM using Docker Compose.

## Database Options

| Option | RAM Required | Compose File | Notes |
|--------|--------------|--------------|------|
| **PostgreSQL** | ~512MB | `docker-compose.prod-pgsql.yml` | Recommended for 1GB VMs |
| **MSSQL** | ≥2GB | `docker-compose.prod.yml` | Requires VM with 2GB+ RAM |

If your Oracle VM has only 1GB RAM, use the PostgreSQL variant.

## 1) Prepare VM

Install Docker and Docker Compose on Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and log back in after `usermod`.

## 2) Clone and configure

```bash
git clone https://github.com/mr-robot77/task-manager-fullstack.git
cd task-manager-fullstack
cp deploy/oracle/.env.prod.example deploy/oracle/.env.prod
```

Edit `deploy/oracle/.env.prod` and set secure values for `APP_SECRET`, `DB_PASSWORD`, `JWT_PASSPHRASE`, and `CORS_ALLOW_ORIGIN` (include your VM IP and `*.hf.space`).

## 3) Start stack

**For 1GB RAM VMs (PostgreSQL):**

```bash
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml up -d
```

**For 2GB+ RAM VMs (MSSQL):**

```bash
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml up -d --build
```

> If the VM cannot reach Docker Hub, build images on a machine with internet access, save them with `docker save`, and load them on the VM with `docker load`.

## 4) Initialize database and JWT keys

Replace `docker-compose.prod-pgsql.yml` with `docker-compose.prod.yml` if using MSSQL.

```bash
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console doctrine:database:create --if-not-exists
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console doctrine:schema:update --force
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

## 5) Verify

- **Frontend:** `http://<VM_PUBLIC_IP>:4200`
- **Backend API:** `http://<VM_PUBLIC_IP>:8000/api`

For production use with a custom domain, add Nginx or Caddy in front and expose only ports 80/443.
