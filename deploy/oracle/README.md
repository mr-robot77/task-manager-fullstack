# Oracle Always Free VM Deployment

This guide deploys the full stack (Angular + Symfony + Database) on one Oracle VM using Docker Compose.

## Database Options

| Option | RAM Required | Compose File | Use Case |
|--------|--------------|--------------|----------|
| **MSSQL** | ≥2GB | `docker-compose.prod.yml` | **Primary** — production and development |
| **PostgreSQL** | ~512MB | `docker-compose.prod-pgsql.yml` | **Demo only** — for VMs with 1GB RAM when MSSQL cannot run |

The project is built around **Microsoft SQL Server** as the primary database. PostgreSQL is supported as a **fallback for demo purposes only** when the VM has insufficient RAM (MSSQL requires ≥2GB). For production, always use MSSQL.

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

**Production / standard (MSSQL, 2GB+ RAM):**

```bash
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml up -d --build
```

**Demo only (PostgreSQL, 1GB RAM VMs):**

```bash
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml up -d
```

> If the VM cannot reach Docker Hub, build images on a machine with internet access, save them with `docker save`, and load them on the VM with `docker load`.

## 4) Initialize database, JWT, and demo data

The backend `docker-entrypoint.sh` runs automatically on container start:

- `doctrine:database:create --if-not-exists`
- `doctrine:schema:update --force`
- `lexik:jwt:generate-keypair --skip-if-exists`
- `app:load-demo-data`

**Manual init (optional)** — if you need to re-run:

```bash
# MSSQL (production):
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console doctrine:database:create --if-not-exists
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console doctrine:schema:update --force
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml exec -T backend php bin/console app:load-demo-data

# PostgreSQL (demo only):
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console doctrine:database:create --if-not-exists
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console doctrine:schema:update --force
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod-pgsql.yml exec -T backend php bin/console app:load-demo-data
```

**Demo login:** `demo@example.com` / `demodemo`

## 5) Verify

- **Frontend:** `http://<VM_PUBLIC_IP>:4200`
- **Backend API:** `http://<VM_PUBLIC_IP>:8000/api`

For production use with a custom domain, add Nginx or Caddy in front and expose only ports 80/443.
