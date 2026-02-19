# Production Line Task and Equipment Manager

[![CI/CD Pipeline](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml/badge.svg)](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/ci.yml)
[![Smoke Test API](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml/badge.svg)](https://github.com/mr-robot77/task-manager-fullstack/actions/workflows/smoke-test.yml)

A full-stack web application for managing production line tasks and equipment in semiconductor manufacturing environments. Built with **Symfony (PHP)**, **Angular**, and **Microsoft SQL Server**, fully containerized with **Docker**.

## Tech Stack

| Layer          | Technology                                |
|----------------|-------------------------------------------|
| Frontend       | Angular 17+, TypeScript, Material         |
| Backend        | PHP 8.2, Symfony 7.2                      |
| Database       | Microsoft SQL Server 2022 or PostgreSQL 15 |
| Container      | Docker, Docker Compose                    |
| CI/CD          | GitHub Actions                            |
| Live Dashboard | Gradio on Hugging Face Spaces (optional)  |

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

Access the application:

- **Frontend**: <http://localhost:4200>
- **Backend API**: <http://localhost:8000/api>
- **MSSQL**: `localhost:1433`

## Hybrid Live Deployment (Recommended Free Setup)

Use this hybrid model for a stable free public demo:

- **Oracle Cloud Always Free VM** hosts full stack (`frontend`, `backend`, `database`).
- **Hugging Face Spaces (Gradio)** shows a public live dashboard by reading backend stats APIs.

### 1) Deploy full stack to Oracle VM

See complete steps in `deploy/oracle/README.md`. Use the PostgreSQL compose file for 1GB RAM VMs.

### 2) Deploy public dashboard to Hugging Face Spaces

Use files in `hf-dashboard/`. Set the Space variable:

- **Key:** `BACKEND_API_BASE`
- **Value:** `http://YOUR_ORACLE_VM_IP:8000/api` (use `http://` unless you have HTTPS configured)

Then share your HF Space URL as the public live dashboard link.

### Initialize Database

```bash
docker compose exec backend php bin/console doctrine:database:create --if-not-exists
docker compose exec backend php bin/console doctrine:schema:update --force
```

### Generate JWT Keys

```bash
docker compose exec backend php bin/console lexik:jwt:generate-keypair
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

## Project Structure

```text
.
├── backend/                    # Symfony PHP API
│   ├── src/
│   │   ├── Controller/         # API endpoints
│   │   ├── Entity/             # Database models
│   │   └── Repository/         # Data access layer
│   ├── config/                 # Symfony configuration
│   ├── Dockerfile
│   └── composer.json
│
├── frontend/                   # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # UI components
│   │   │   ├── services/       # Task and equipment API services
│   │   │   └── interceptors/   # HTTP interceptors
│   ├── Dockerfile
│   └── package.json
│
├── deploy/oracle/              # Oracle VM production overrides and guide
├── hf-dashboard/               # Gradio dashboard for Hugging Face Spaces
│
├── docker-compose.yml          # Multi-container orchestration
├── .github/workflows/ci.yml    # CI/CD pipeline
└── README.md
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

### Backend tests

```bash
cd backend
php vendor/bin/phpunit --testdox
```

### Frontend tests

```bash
cd frontend
npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox
```

## Coverage

- Backend and frontend coverage reports are generated in CI on every push.
- Dedicated `Smoke Test API` workflow runs on push, pull request, and daily schedule to boot `database` and `backend`, then checks:
  - `GET /api/tasks/statistics`
  - `GET /api/equipment/statistics`
- You can download reports from workflow artifacts:
  - `backend-coverage` (`backend-clover.xml`)
  - `frontend-coverage` (`lcov.info`, HTML report, Cobertura XML)

## License

MIT
