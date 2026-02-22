# Production Line Task and Equipment Manager

<p align="center">
  <a href="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml/badge.svg" alt="CI/CD Pipeline" />
  </a>
  <a href="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml/badge.svg" alt="Smoke Test API" />
  </a>
  <a href="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/deploy-oracle-vm.yml" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/deploy-oracle-vm.yml/badge.svg" alt="Deploy to Oracle VM" />
  </a>
</p>

A full-stack web application for managing production line tasks and equipment in semiconductor manufacturing environments. Built with **Symfony (PHP)**, **Angular**, and **Docker** (PostgreSQL or MSSQL).

---

## Live Hugging Face Dashboard

> ### **[Open Live Dashboard on Hugging Face Spaces](https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard)**
>
> Public Gradio dashboard reading live stats from the Oracle VM backend. Uses demo data when backend is unreachable.

---

## Demo

![Dashboard Demo](assets/demo.gif)

> **To regenerate:** Requires Node.js (root `package.json`). Run `npm install`, `npx playwright install chromium`, then:
> - **Local:** `docker compose up` then `npm run make-demo-gif`
> - **Oracle VM:** `$env:BASE_URL="http://152.70.53.27:4200"; npm run make-demo-gif` (PowerShell) or `BASE_URL=http://152.70.53.27:4200 npm run make-demo-gif` (Bash)
> The GIF script (`scripts/make-demo-gif.mjs`) captures Dashboard, Tasks, Equipment; crops 80px from the bottom. Uses Playwright Chromium, gifencoder, png-file-stream.

---

## Architecture

```
┌─────────────────┐     HTTP      ┌─────────────────┐     REST/JSON     ┌─────────────────┐
│  Angular SPA    │◄─────────────►│  Symfony API    │◄────────────────►│  MSSQL / PG     │
│  port 4200      │  (proxy/cors) │  port 8000      │  Doctrine ORM    │  1433 / 5432    │
└─────────────────┘              └─────────────────┘                  └─────────────────┘
         │                                  │
         │                                  │ GET /api/tasks/statistics
         │                                  │ GET /api/equipment/statistics
         ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Hugging Face Spaces (Gradio) — optional public dashboard reading backend stats APIs   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 17 SPA (standalone components). Served by Nginx in Docker (port 80→4200) or `ng serve` (dev). Proxies `/api` to backend. Tasks and Equipment routes are eager-loaded for fast navigation. |
| **Backend** | Symfony PHP API. PHP built-in server (dev) or same in container. JWT auth via `lexik/jwt-authentication-bundle`. |
| **Database** | MSSQL primary; PostgreSQL supported for demo deployments (see below). |

---

## Tech Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Frontend | Angular, TypeScript, Angular Material | 17.3, ES2022 |
| Backend | PHP, Symfony | 8.2, 7.2 |
| ORM | Doctrine | 3.x |
| Database | Microsoft SQL Server / PostgreSQL | 2022 / 15 |
| Auth | JWT (lexik/jwt-authentication-bundle) | Stateless |
| Container | Docker, Docker Compose | Compose v2 |
| CI/CD | GitHub Actions | ubuntu-22.04 |
| Live Dashboard | Gradio (Hugging Face) | 4.44+, optional |

### Database Options

| Option | RAM | Compose File | Use Case |
|--------|-----|--------------|----------|
| **PostgreSQL** | ~512MB | `docker-compose.yml` (default) | Local dev, Windows-friendly |
| **MSSQL** | ≥2GB | `docker-compose.mssql.yml` | Production, when MSSQL preferred |
| **PostgreSQL** | ~1GB | `deploy/oracle/docker-compose.prod-pgsql.yml` | Oracle Always Free VM |

---

## Features

- JWT-based authentication (register / login)
- Full CRUD for production tasks and equipment
- Link tasks with equipment units
- Filter by status, priority, production line
- Operational dashboard in Angular
- **Live dashboard on Hugging Face Spaces** — public Gradio app
- Responsive Material Design UI
- Fully containerized with Docker Compose
- Automated CI/CD with GitHub Actions

---

## Quick Start

### Prerequisites

- <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener noreferrer">Docker Desktop</a>
- <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">Git</a>

### Run the Application

```bash
git clone https://github.com/mr-robot77/task-manager-fullstack.git
cd task-manager-fullstack
docker compose up --build
```

The default `docker-compose.yml` uses **PostgreSQL** (reliable on Windows/Docker Desktop). For MSSQL, use:

```bash
docker compose -f docker-compose.mssql.yml up --build
```

Wait for the backend healthcheck (~90 seconds). Then:

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:4200](http://localhost:4200) |
| **API** | [http://localhost:8000/api](http://localhost:8000/api) |

### Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 4200 | Angular SPA (Nginx in Docker) |
| Backend | 8000 | Symfony API |
| Database | 5432 | PostgreSQL (default); MSSQL uses 1433 |

### Demo Data

On first `docker compose up`, the backend automatically:

- Creates the database and applies schema
- Generates JWT keys
- Loads demo data (9 tasks, 7 equipment)

**Demo login:** `demo@example.com` / `demodemo` — frontend auto-authenticates on first visit via `APP_INITIALIZER` (calls demo login if no token exists).

If the backend is unreachable, the frontend shows demo data immediately (optimistic loading). API calls use a 2.5s timeout and 1 retry (400ms); 4xx errors skip retries. When the API succeeds, data is replaced with live results.

---

## Live URLs

| Environment | Frontend | Backend API | Live Dashboard |
|-------------|----------|-------------|----------------|
| **Local** | [localhost:4200](http://localhost:4200) | [localhost:8000/api](http://localhost:8000/api) | — |
| **Oracle VM** | [152.70.53.27:4200](http://152.70.53.27:4200) | [152.70.53.27:8000/api](http://152.70.53.27:8000/api) | — |
| **Hugging Face** | — | — | **[→ Live Dashboard](https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard)** |

> **Oracle VM:** If the dashboard shows zeros, run `./deploy/oracle/sync-and-deploy.sh` on the VM.  
> **Hugging Face:** The HF dashboard reads from the Oracle VM backend (`BACKEND_API_BASE`). Replace `152.70.53.27` with your VM IP if deploying elsewhere.

---

## Hybrid Deployment (Recommended Free Setup)

- **Oracle Cloud Always Free VM** — full stack (frontend, backend, database)
- **Hugging Face Spaces (Gradio)** — public live dashboard reading backend stats

### 1) Deploy to Oracle VM

See `deploy/oracle/README.md`. The GitHub Actions workflow uses PostgreSQL (`docker-compose.prod-pgsql.yml`) because Oracle Always Free VMs have ~1GB RAM and MSSQL requires ≥2GB. No database port is exposed to the host. Before starting, the workflow stops containers using ports 4200 or 8000.

### 2) Deploy Dashboard to Hugging Face

```bash
pip install huggingface_hub
python hf-dashboard/deploy_to_hf.py   # from project root; requires HF_TOKEN or huggingface-cli login
```

Set `$env:HF_TOKEN="hf_xxx"` (PowerShell) or `HF_TOKEN=hf_xxx` (Bash). The script uploads files and sets `BACKEND_API_BASE` to the Oracle VM.

### Manual Commands

```bash
docker compose exec backend php bin/console doctrine:schema:update --force
docker compose exec backend php bin/console app:load-demo-data --no-interaction
```

Use `--force` with `app:load-demo-data` to add more demo tasks/equipment when the demo user already exists.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| POST | `/api/register` | Public | Register user |
| POST | `/api/login_check` | Public | Login (returns JWT) |
| GET | `/api/me` | Required | Current user |
| GET | `/api/tasks` | Required | List tasks (filterable) |
| POST | `/api/tasks` | Required | Create task |
| GET | `/api/tasks/{id}` | Required | Get task |
| PUT | `/api/tasks/{id}` | Required | Update task |
| DELETE | `/api/tasks/{id}` | Required | Delete task |
| GET | `/api/tasks/statistics` | Public | Task stats |
| GET | `/api/equipment` | Required | List equipment (filterable) |
| POST | `/api/equipment` | Required | Create equipment |
| GET | `/api/equipment/{id}` | Required | Get equipment |
| PUT | `/api/equipment/{id}` | Required | Update equipment |
| DELETE | `/api/equipment/{id}` | Required | Delete equipment |
| GET | `/api/equipment/statistics` | Public | Equipment stats |

### Query Parameters

**Tasks:** `status`, `priority`, `productionLine`  
**Equipment:** `status`, `type`, `productionLine`

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Doctrine connection | `mssql://sa:PWD@database:1433/...` |
| `APP_SECRET` | Symfony secret | 32+ chars |
| `JWT_PASSPHRASE` | Lexik JWT passphrase | Any string |
| `CORS_ALLOW_ORIGIN` | CORS regex | `^https?://(localhost\|...)` |
| `BACKEND_API_BASE` | HF dashboard backend URL | `http://VM_IP:8000/api` |

For production, use `deploy/oracle/.env.prod`.

---

## Project Structure

```
task-manager-fullstack/
├── backend/                    # Symfony PHP API
│   ├── src/
│   │   ├── Command/            # CLI (e.g. app:load-demo-data)
│   │   ├── Controller/         # API endpoints
│   │   ├── Entity/             # Task, Equipment, User
│   │   └── Repository/         # Doctrine repos
│   ├── config/
│   ├── docker-entrypoint.sh
│   └── Dockerfile
├── frontend/                   # Angular SPA (standalone)
│   ├── src/app/
│   │   ├── components/         # Dashboard, task-list, equipment-list, forms, login
│   │   ├── services/           # task.service, equipment.service, auth.service
│   │   └── interceptors/       # JWT auth header
│   ├── nginx.conf              # Prod: proxy /api to backend
│   └── Dockerfile
├── deploy/oracle/              # Oracle VM deploy
│   ├── docker-compose.prod-pgsql.yml
│   └── README.md
├── hf-dashboard/               # Hugging Face Gradio
│   ├── app.py
│   └── deploy_to_hf.py
├── assets/                     # demo.gif
├── package.json                # Root: make-demo-gif script (gifencoder, playwright)
├── scripts/make-demo-gif.mjs
└── .github/workflows/
```

---

## Development

**Backend (without Docker):**
```bash
cd backend && composer install && php bin/console server:start
```

**Frontend (without Docker):**
```bash
cd frontend && npm install && ng serve
```

---

## Testing

**Backend** (SQLite in-memory, no MSSQL):
```bash
cd backend && php vendor/bin/phpunit --testdox
```

**Frontend** (FirefoxHeadless):
```bash
cd frontend && npm run test:ci
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Demo data instead of live API** | Ensure backend is healthy (`docker compose ps`). Frontend shows demo data immediately; API has 2.5s timeout and 1 retry before staying on demo. |
| **Oracle VM: demo data or zeros** | Redeploy with latest code. Run `./deploy/oracle/sync-and-deploy.sh` on the VM. Ensure backend container is healthy. |
| **Backend exits: "no such file or directory"** | CRLF on Windows. Run `git add --renormalize .` and rebuild. |

---

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| **CI/CD Pipeline** | Push/PR to main | Backend: composer, phpunit. Frontend: npm ci, lint, build. Docker build. |
| **Smoke Test** | Push/PR, cron, manual | PostgreSQL + backend, curls stats endpoints. |
| **Deploy Oracle VM** | Manual | Builds images, SCPs to VM, uses prod-pgsql. Requires `ORACLE_VM_HOST`, `ORACLE_VM_USER`, `ORACLE_VM_SSH_KEY`. |
