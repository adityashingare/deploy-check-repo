# BLFA Learning Lab — WordPress Backend (Headless CMS)

A containerized Headless WordPress CMS environment orchestrated with Docker Compose, featuring **Nginx reverse proxy**, **WordPress PHP 8.2-FPM**, and **MySQL 8.0**.

> **Crucial Architecture Rule**: The backend strictly avoids custom Dockerfiles! All services run directly on official, unmodified, upstream container images (`wordpress:php8.2-fpm-alpine`, `nginx:1.27-alpine`, `mysql:8.0`).

---

## 1. Project Overview & Repository Structure

The BLFA Learning Lab uses **ONE Git repository with TWO long-lived branches**:

```
                       ┌── [frontend branch]  ── Next.js App, Dockerfile, Compose, Frontend CI
[Initial Git Commit]  ─┤
                       └── [backend branch]   ── WordPress PHP-FPM, Nginx, MySQL 8, Backend CI
```

- **`backend` branch**: Contains the Headless WordPress configuration, Nginx reverse proxy, MySQL 8 database, automated provisioning scripts, and `backend-ci.yml`.
- **`frontend` branch**: Contains the Next.js 14 application, multi-stage production `Dockerfile`, frontend `docker-compose.yml`, and `frontend-ci.yml`.
- **Concurrent Development**: Developers maintain both branches side-by-side using **Git Worktrees** (`git worktree add ..\blfa-backend backend`) or detached background Docker containers.

---

## 2. Documentation Deliverables Index

Every architectural dimension and operation is comprehensively documented in the `docs/` directory:

| Documentation Guide | Primary Topics Covered |
| :--- | :--- |
| **[Local Setup & Quickstart Guide](docs/LOCAL_SETUP.md)** | Step-by-step local provisioning for Windows with Git & Docker Desktop. |
| **[Docker Concepts & Architecture](docs/DOCKER_CONCEPTS.md)** | Dockerfile vs. Compose, Image vs. Container, and why no custom backend Dockerfile is used. |
| **[Local Networking & URL Architecture](docs/NETWORKING.md)** | Bridge network `blfa-network`, browser-facing URLs vs. internal container service discovery (`http://nginx/graphql`). |
| **[Environment Variables Reference](docs/ENV_VARS.md)** | Complete specification of frontend and backend variables, security rules, and build-time vs. runtime behaviors. |
| **[Nginx Routing Guide](docs/NGINX_ROUTING.md)** | Reverse proxy configuration, FastCGI PHP pass (`wordpress:9000`), static caching, and `/healthz`. |
| **[Git Branch & Worktree Management](docs/GIT_BRANCHES.md)** | Maintaining two separate branches in one repository, safe branch switching, and Git worktrees. |
| **[GitHub Actions CI Guide](docs/CI_GUIDE.md)** | Frontend and backend CI pipelines, least privilege permissions, and local validation. |
| **[Troubleshooting & Operations Guide](docs/TROUBLESHOOTING.md)** | Exact diagnostic commands, fixing 403, 404, 502, 503, database resets, and log inspection. |

---

## 3. Backend Services & Volume Architecture

| Service | Container Name | Base Image | Role | Port(s) |
| :--- | :--- | :--- | :--- | :--- |
| **`nginx`** | `blfa-nginx` | `nginx:1.27-alpine` | Reverse proxy, static file server, health check endpoint. | Host `9000:80` |
| **`wordpress`**| `blfa-wordpress`| `wordpress:php8.2-fpm-alpine` | Headless WordPress CMS executing via FastCGI. | Internal `9000` |
| **`db`** | `blfa-mysql` | `mysql:8.0` | Relational database with persistent named volume. | Internal `3306` |
| **`wp-cli`** | `blfa-wp-cli` | `wordpress:cli-php8.2` | Automated management utility tool profile. | N/A (Utility) |

### Shared Volumes:
1. **`blfa_wp_data` (`/var/www/html`)**: Shared between `wordpress` (read-write) and `nginx` (read-only) for core files, plugins, and media uploads.
2. **`blfa_db_data` (`/var/lib/mysql`)**: Persistent MySQL data storage.

---

## 4. Quickstart: Automated Setup

On Windows PowerShell:

```powershell
# Run the all-in-one setup script:
.\scripts\setup-backend.ps1
```

Or on Linux / macOS / WSL:
```bash
./scripts/setup-backend.sh
```

---

## 5. Endpoints & Verifications

- **WordPress Admin**: [http://localhost:9000/wp-admin](http://localhost:9000/wp-admin) (`admin` / `admin_local_pass123!`)
- **WPGraphQL Endpoint**: [http://localhost:9000/graphql](http://localhost:9000/graphql)
- **Nginx Health Check**: [http://localhost:9000/healthz](http://localhost:9000/healthz)
- **Validate Nginx Configuration**: `docker compose exec nginx nginx -t`
- **Validate Compose Specification**: `docker compose config --quiet`
