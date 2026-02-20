# Production Line Task and Equipment Manager

[![CI/CD Pipeline](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml/badge.svg)](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml)
[![Smoke Test API](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml/badge.svg)](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml)

A full-stack web application for managing production line tasks and equipment in semiconductor manufacturing environments. Built with **Symfony (PHP)**, **Angular**, and **Microsoft SQL Server**, fully containerized with **Docker**.

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

- **Frontend**: Angular SPA served by Nginx (prod) or ng serve (dev). Proxies `/api` to backend.
- **Backend**: PHP built-in server (dev) or same in container. JWT auth via `lexik/jwt-authentication-bundle`.
- **Database**: MSSQL primary; PostgreSQL supported for demo deployments (see below).

---

## Tech Stack (Versions)

| Layer          | Technology                                | Version / Notes |
|----------------|-------------------------------------------|-----------------|
| Frontend       | Angular, TypeScript, Angular Material     | 17.3, ES2022    |
| Backend        | PHP, Symfony                              | 8.2, 7.2        |
| ORM            | Doctrine                                  | 3.x             |
| Database       | Microsoft SQL Server / PostgreSQL         | 2022 / 15       |
| Auth           | JWT (lexik/jwt-authentication-bundle)     | Stateless       |
| Container      | Docker, Docker Compose                    | Compose v2      |
| CI/CD          | GitHub Actions                            | ubuntu-22.04    |
| Live Dashboard | Gradio                                    | 4.44+, optional |

### Database

- **Primary:** Microsoft SQL Server 2022 — local development and production (VM needs ≥2GB RAM).
- **Demo fallback:** PostgreSQL 15 — only when VM has ~1GB RAM. Use `deploy/oracle/docker-compose.prod-pgsql.yml`. Production should use MSSQL.

## Features

- JWT-based authentication (register / login)
- Full CRUD operations for production tasks
- Full CRUD operations for production equipment
- Link tasks with equipment units
- Filter tasks by status, priority, and production line
- Operational dashboard in Angular
- Optional hybrid live dashboard (Oracle VM backend + HF Spaces)
- Responsive Material Design UI
- Fully containerized with Docker Compose
- Automated CI/CD pipeline with GitHub Actions

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Run the Application

```bash
git clone https://github.com/mr-robot77/task-manager-fullstack.git
cd task-manager-fullstack
docker compose up --build
```

### Ports

| Service   | Port | Description                    |
|-----------|------|--------------------------------|
| Frontend  | 4200 | Angular SPA (dev: ng serve)   |
| Backend   | 8000 | Symfony API                    |
| MSSQL     | 1433 | Database (PostgreSQL: 5432)   |

Access: **Frontend** <http://localhost:4200> · **API** <http://localhost:8000/api>

### Demo Data

After initial setup, load sample tasks and equipment:

```bash
docker compose exec backend php bin/console app:load-demo-data
```

Then log in with **demo@example.com** / **demodemo**.

## Hybrid Live Deployment (Recommended Free Setup)

Use this hybrid model for a stable free public demo:

- **Oracle Cloud Always Free VM** hosts full stack (`frontend`, `backend`, `database`).
- **Hugging Face Spaces (Gradio)** shows a public live dashboard by reading backend stats APIs.

### 1) Deploy full stack to Oracle VM

See complete steps in `deploy/oracle/README.md`. By default use MSSQL (2GB+ RAM). For demo only on 1GB RAM VMs, use the PostgreSQL compose file.

### 2) Deploy public dashboard to Hugging Face Spaces

Use files in `hf-dashboard/`. Set the Space variable:

- **Key:** `BACKEND_API_BASE`
- **Value:** `http://YOUR_ORACLE_VM_IP:8000/api` (use `http://` unless you have HTTPS configured)

Then share your HF Space URL as the public live dashboard link.

### Initialize Database and JWT

```bash
docker compose exec backend php bin/console doctrine:database:create --if-not-exists
docker compose exec backend php bin/console doctrine:schema:update --force
docker compose exec backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

### Load Demo Data (Optional)

```bash
docker compose exec backend php bin/console app:load-demo-data
```

## API Endpoints

| Method | Endpoint                    | Auth     | Description          |
|--------|-----------------------------|----------|----------------------|
| POST   | `/api/register`             | Public   | Register a new user  |
| POST   | `/api/login_check`          | Public   | Login (returns JWT)  |
| GET    | `/api/me`                   | Required | Current user info    |
| GET    | `/api/tasks`                | Required | List tasks (filterable) |
| POST   | `/api/tasks`                | Required | Create a new task    |
| GET    | `/api/tasks/{id}`           | Required | Get task details     |
| PUT    | `/api/tasks/{id}`           | Required | Update a task        |
| DELETE | `/api/tasks/{id}`           | Required | Delete a task        |
| GET    | `/api/tasks/statistics`     | Public   | Dashboard statistics |
| GET    | `/api/equipment`            | Required | List equipment (filterable) |
| POST   | `/api/equipment`            | Required | Create equipment     |
| GET    | `/api/equipment/{id}`       | Required | Get equipment details |
| PUT    | `/api/equipment/{id}`       | Required | Update equipment     |
| DELETE | `/api/equipment/{id}`       | Required | Delete equipment     |
| GET    | `/api/equipment/statistics` | Public   | Equipment statistics |

### Query Parameters for Task List

- `status`: `todo`, `in_progress`, `review`, `done`
- `priority`: `low`, `medium`, `high`, `critical`
- `productionLine`: production line name

### Query Parameters for Equipment List

- `status`: `available`, `in_use`, `maintenance`, `offline`
- `type`: `machine`, `robot`, `conveyor`, `sensor`, `tooling`
- `productionLine`: production line name

## Environment Variables

| Variable           | Description                    | Example (local)                     |
|--------------------|--------------------------------|-------------------------------------|
| `DATABASE_URL`     | Doctrine connection string (add `?TrustServerCertificate=yes` for ODBC 18) | `mssql://sa:PWD@database:1433/...`  |
| `APP_SECRET`       | Symfony secret                 | 32+ character string                |
| `JWT_PASSPHRASE`   | Lexik JWT key passphrase       | Any string                          |
| `CORS_ALLOW_ORIGIN`| Allowed CORS origins (regex)   | `^https?://(localhost\|...)`        |
| `BACKEND_API_BASE` | HF dashboard backend URL        | `http://VM_IP:8000/api`             |

For production, use `deploy/oracle/.env.prod` and set strong secrets.

## Project Structure

```text
.
├── backend/                    # Symfony PHP API
│   ├── src/
│   │   ├── Command/            # CLI commands (e.g. app:load-demo-data)
│   │   ├── Controller/         # API endpoints
│   │   ├── Entity/             # Task, Equipment, User
│   │   └── Repository/         # Doctrine repositories
│   ├── config/                 # Symfony + Doctrine + security
│   ├── phpunit.dist.xml        # Tests use SQLite in-memory (no MSSQL in CI)
│   └── Dockerfile              # PHP 8.2 + MSSQL + PostgreSQL drivers
│
├── frontend/                   # Angular SPA
│   ├── src/app/
│   │   ├── components/         # Task list, equipment, dashboard
│   │   ├── services/           # API services
│   │   └── interceptors/       # JWT auth header
│   ├── angular.json            # Build config (production uses prod env)
│   ├── karma.conf.js           # Tests (FirefoxHeadless)
│   └── Dockerfile              # Multi-stage: Node build → Nginx serve
│
├── deploy/oracle/               # Oracle VM deployment
│   ├── docker-compose.prod.yml # MSSQL (production)
│   ├── docker-compose.prod-pgsql.yml  # PostgreSQL (demo only)
│   └── README.md               # Step-by-step deploy guide
│
├── hf-dashboard/               # Gradio live dashboard (Hugging Face Spaces)
│   ├── app.py
│   ├── requirements.txt
│   └── deploy_to_hf.py        # Upload + configure HF Space
│
├── docker-compose.yml          # Local dev: database, backend, frontend
└── .github/workflows/          # ci.yml, smoke-test.yml
```

## Development

### Backend (without Docker)

```bash
cd backend
composer install
php bin/console server:start
```

### Frontend (without Docker)

```bash
cd frontend
npm install
ng serve
```

## Testing

### Backend tests (SQLite in-memory, no external DB)

```bash
cd backend
php vendor/bin/phpunit --testdox
```

Backend tests use `DATABASE_URL=sqlite:///:memory:` so CI runs without MSSQL.

### Frontend tests

```bash
cd frontend
npm run test:ci
```

Uses FirefoxHeadless. Run locally; not executed in CI (lint and build only).

## CI/CD

| Workflow      | Trigger                    | Steps                                                                 |
|---------------|----------------------------|-----------------------------------------------------------------------|
| **CI/CD Pipeline** | Push/PR to main, develop | Backend: composer, phpunit (SQLite). Frontend: npm ci, lint, build. Docker build both images. (Karma tests run locally only.) |
| **Smoke Test**    | Push/PR, daily cron, manual | Starts database + backend, runs doctrine init (TrustServerCertificate for ODBC 18), curls `/api/tasks/statistics` and `/api/equipment/statistics`. |

Artifacts: `backend-coverage` (clover XML).

## License

MIT
