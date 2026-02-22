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

A full-stack web application for managing production line tasks and equipment in semiconductor manufacturing environments. Built with **Symfony (PHP)**, **Angular**, and **Microsoft SQL Server**, fully containerized with **Docker**.

---

## Live Hugging Face Dashboard

> ### **[Open Live Dashboard on Hugging Face Spaces](https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard)**
>
> Public Gradio dashboard reading live stats from the Oracle VM backend. Uses demo data when backend is unreachable.

---

## Demo

![Dashboard Demo](assets/demo.gif)

> **To regenerate the GIF:** Run the app (`docker compose up`), then:
> ```bash
> npm install
> npx playwright install chromium
> npm run make-demo-gif
> ```
> Or with a remote URL: `BASE_URL=http://your-vm-ip:4200 npm run make-demo-gif`

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
| **Frontend** | Angular SPA served by Nginx (prod) or ng serve (dev). Proxies `/api` to backend. |
| **Backend** | PHP built-in server (dev) or same in container. JWT auth via `lexik/jwt-authentication-bundle`. |
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
| **MSSQL** | ≥2GB | default | Production & local dev |
| **PostgreSQL** | ~512MB | `docker-compose.smoke.yml` | Smoke test, MCR auth fallback |
| **PostgreSQL** | ~1GB | `deploy/oracle/docker-compose.prod-pgsql.yml` | Oracle Always Free VM (1GB RAM) |

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

**If MSSQL image fails to pull** (MCR auth required):

```bash
docker compose -f docker-compose.smoke.yml up --build
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
| MSSQL | 1433 | Database (PostgreSQL: 5432) |

### Demo Data

On first `docker compose up`, the backend automatically:

- Creates the database and applies schema
- Generates JWT keys
- Loads demo data (9 tasks, 7 equipment)

**Demo login:** `demo@example.com` / `demodemo` — frontend auto-authenticates on first visit.

If the backend is unreachable, the frontend retries (4×, 2s delay) and silently shows built-in demo data.

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
cd hf-dashboard
python deploy_to_hf.py   # requires HF_TOKEN or huggingface-cli login
```

The script uploads files, sets `BACKEND_API_BASE`, and resolves variable/secret collisions.

### Manual Commands

```bash
docker compose exec backend php bin/console doctrine:schema:update --force
docker compose exec backend php bin/console app:load-demo-data --force
```

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
├── frontend/                   # Angular SPA
│   ├── src/app/
│   │   ├── components/         # Dashboard, tasks, equipment
│   │   ├── services/
│   │   └── interceptors/      # JWT header
│   └── Dockerfile
├── deploy/oracle/              # Oracle VM deploy
│   ├── docker-compose.prod-pgsql.yml
│   └── README.md
├── hf-dashboard/               # Hugging Face Gradio
│   ├── app.py
│   └── deploy_to_hf.py
├── assets/                     # demo.gif (npm run make-demo-gif)
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
| **Demo data instead of live API** | Ensure backend is running (`docker compose ps`). Frontend retries 4× with 2s delay, then falls back to demo data. |
| **Backend exits: "no such file or directory"** | CRLF line endings on Windows. Run `git add --renormalize .` and rebuild. |
| **Oracle VM shows zeros** | Pull latest code and run `./deploy/oracle/sync-and-deploy.sh` on the VM. |

---

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| **CI/CD Pipeline** | Push/PR to main | Backend: composer, phpunit. Frontend: npm ci, lint, build. Docker build. |
| **Smoke Test** | Push/PR, cron, manual | PostgreSQL + backend, curls stats endpoints. |
| **Deploy Oracle VM** | Manual | Builds images, SCPs to VM, uses prod-pgsql. Requires `ORACLE_VM_HOST`, `ORACLE_VM_USER`, `ORACLE_VM_SSH_KEY`. |
