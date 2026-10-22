# BLFA Learning Lab — Next.js + Headless WordPress with Docker

A comprehensive, production-grade local development environment replicating the decoupled microservices architecture of the client's BLFA website.

---

## 1. Project Overview & Repository Structure

The BLFA Learning Lab uses **ONE Git repository with TWO long-lived branches**:

```
                       ┌── [frontend branch]  ── Next.js App, Dockerfile, Compose, Frontend CI
[Initial Git Commit]  ─┤
                       └── [backend branch]   ── WordPress PHP-FPM, Nginx, MySQL 8, Backend CI
```

- **`frontend` branch**: Contains the Next.js 14 application, multi-stage production `Dockerfile`, frontend `docker-compose.yml`, and `frontend-ci.yml`.
- **`backend` branch**: Contains the Headless WordPress configuration, Nginx reverse proxy, MySQL 8 database, automated provisioning scripts, and `backend-ci.yml`. **Strictly requires ZERO custom WordPress Dockerfiles.**
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

## 3. Frontend Architecture Highlights

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailored Vanilla CSS Design System with responsive grid, glassmorphic cards, and micro-interactions
- **Containerization**: Multi-stage production `Dockerfile` (Alpine Linux, non-root user `nextjs:nodejs`, standalone output)
- **Data Layer**: GraphQL queries against WPGraphQL with automatic fallback caching for offline resilience
- **Endpoints**:
  - `/` — Homepage featuring architecture showcase and highlighted articles
  - `/blog` — Complete blog listing with categories and reading times
  - `/blog/[slug]` — Dynamic individual post detail rendered from WordPress content
  - `/contact` — Client form with real-time UI validation and server-side verification
  - `/api/contact` — Next.js API route performing strict server-side payload validation
  - `/api/health` — Frontend health check endpoint reporting status, uptime, and target WPGraphQL endpoint

---

## 4. Local Quickstart (Frontend)

### Running with Docker Compose
```bash
# Attach to the shared Docker network 'blfa-network':
docker compose up --build -d

# Check health and status:
docker compose ps
curl http://localhost:3000/api/health
```

### Running Locally on Host (Node 20+)
```bash
npm ci
cp .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
