# Production Line Task Manager

A full-stack web application for managing production line tasks in semiconductor manufacturing environments. Built with **Symfony (PHP)**, **Angular**, and **Microsoft SQL Server**, fully containerized with **Docker**.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Angular 17+, TypeScript, Material   |
| Backend    | PHP 8.2, Symfony 7.2                |
| Database   | Microsoft SQL Server 2022           |
| Container  | Docker, Docker Compose              |
| CI/CD      | GitHub Actions                      |

## Features

- JWT-based authentication (register / login)
- Full CRUD operations for production tasks
- Filter tasks by status, priority, and production line
- Dashboard with real-time statistics
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
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000/api
- **MSSQL**: localhost:1433

### Initialize Database

```bash
docker compose exec backend php bin/console doctrine:database:create
docker compose exec backend php bin/console doctrine:schema:create
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

### Query Parameters for Task List

- `status`: `todo`, `in_progress`, `review`, `done`
- `priority`: `low`, `medium`, `high`, `critical`
- `productionLine`: production line name

## Project Structure

```
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
│   │   │   ├── services/       # API services
│   │   │   └── interceptors/   # HTTP interceptors
│   ├── Dockerfile
│   └── package.json
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

## License

MIT
